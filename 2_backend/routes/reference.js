const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const cache = new Map();

// Cache middleware
const cacheMiddleware = (key, duration = CACHE_DURATION) => {
    return (req, res, next) => {
        const cacheKey = `${key}_${JSON.stringify(req.query)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < duration) {
            return res.json(cached.data);
        }
        
        res.sendCachedResponse = (data) => {
            cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            res.json(data);
        };
        
        next();
    };
};

// Clear cache utility
const clearCache = (pattern = null) => {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
};

// ============================================================================
// COUNTRIES API
// ============================================================================

/**
 * GET /api/reference/countries
 * Returns list of all countries with codes and basic information
 */
router.get('/countries', 
    cacheMiddleware('countries'),
    [
        query('search').optional().isLength({ max: 100 }).trim(),
        query('active_only').optional().isBoolean().toBoolean(),
        query('include_calling_codes').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { search, active_only = true, include_calling_codes = false } = req.query;
            
            let query = `
                SELECT 
                    country_code,
                    country_name,
                    country_name_local,
                    region,
                    sub_region,
                    capital,
                    currency_code,
                    currency_name,
                    is_active,
                    created_at
                FROM COUNTRY 
                WHERE 1=1
            `;
            
            const params = [];
            
            if (active_only) {
                query += ' AND is_active = TRUE';
            }
            
            if (search) {
                query += ' AND (country_name LIKE ? OR country_code LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            
            if (include_calling_codes) {
                query = query.replace('created_at', 'calling_code, created_at');
            }
            
            query += ' ORDER BY country_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                countries: rows,
                total: rows.length,
                filters: {
                    search: search || null,
                    active_only,
                    include_calling_codes
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Countries API error:', error);
            res.status(500).json({ error: 'Failed to fetch countries' });
        }
    }
);

/**
 * GET /api/reference/countries/:countryCode
 * Returns detailed information about a specific country
 */
router.get('/countries/:countryCode', 
    cacheMiddleware('country_details'),
    async (req, res) => {
        try {
            const { countryCode } = req.params;
            
            const [rows] = await req.db.query(`
                SELECT c.*, 
                       COUNT(s.state_code) as total_states,
                       GROUP_CONCAT(DISTINCT c.timezone_codes) as timezones
                FROM COUNTRY c
                LEFT JOIN STATE s ON c.country_code = s.country_code
                WHERE c.country_code = ? AND c.is_active = TRUE
                GROUP BY c.country_code
            `, [countryCode]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Country not found' });
            }
            
            const country = rows[0];
            country.timezones = country.timezones ? country.timezones.split(',') : [];
            
            res.sendCachedResponse ? res.sendCachedResponse(country) : res.json(country);
            
        } catch (error) {
            console.error('Country details API error:', error);
            res.status(500).json({ error: 'Failed to fetch country details' });
        }
    }
);

// ============================================================================
// STATES/PROVINCES API
// ============================================================================

/**
 * GET /api/reference/states
 * Returns states/provinces, optionally filtered by country
 */
router.get('/states', 
    cacheMiddleware('states'),
    [
        query('country_code').optional().isLength({ min: 2, max: 3 }).trim(),
        query('search').optional().isLength({ max: 100 }).trim(),
        query('active_only').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { country_code, search, active_only = true } = req.query;
            
            let query = `
                SELECT 
                    s.state_code,
                    s.state_name,
                    s.state_name_local,
                    s.country_code,
                    c.country_name,
                    s.state_type,
                    s.is_active,
                    s.created_at
                FROM STATE s
                INNER JOIN COUNTRY c ON s.country_code = c.country_code
                WHERE 1=1
            `;
            
            const params = [];
            
            if (active_only) {
                query += ' AND s.is_active = TRUE AND c.is_active = TRUE';
            }
            
            if (country_code) {
                query += ' AND s.country_code = ?';
                params.push(country_code);
            }
            
            if (search) {
                query += ' AND (s.state_name LIKE ? OR s.state_code LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            
            query += ' ORDER BY c.country_name ASC, s.state_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                states: rows,
                total: rows.length,
                filters: {
                    country_code: country_code || null,
                    search: search || null,
                    active_only
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('States API error:', error);
            res.status(500).json({ error: 'Failed to fetch states' });
        }
    }
);

/**
 * GET /api/reference/states/:countryCode
 * Returns all states for a specific country
 */
router.get('/states/:countryCode', 
    cacheMiddleware('states_by_country'),
    async (req, res) => {
        try {
            const { countryCode } = req.params;
            const { active_only = true } = req.query;
            
            let query = `
                SELECT 
                    state_code,
                    state_name,
                    state_name_local,
                    state_type,
                    postal_code_format,
                    is_active
                FROM STATE 
                WHERE country_code = ?
            `;
            
            const params = [countryCode];
            
            if (active_only) {
                query += ' AND is_active = TRUE';
            }
            
            query += ' ORDER BY state_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                country_code: countryCode,
                states: rows,
                total: rows.length
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('States by country API error:', error);
            res.status(500).json({ error: 'Failed to fetch states for country' });
        }
    }
);

// ============================================================================
// CITIES API
// ============================================================================

/**
 * GET /api/reference/cities
 * Returns cities, optionally filtered by state/country
 */
router.get('/cities', 
    cacheMiddleware('cities'),
    [
        query('state_code').optional().isLength({ min: 2, max: 5 }).trim(),
        query('country_code').optional().isLength({ min: 2, max: 3 }).trim(),
        query('search').optional().isLength({ max: 100 }).trim(),
        query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
        query('offset').optional().isInt({ min: 0 }).toInt(),
        query('active_only').optional().isBoolean().toBoolean(),
        query('include_coordinates').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                state_code, 
                country_code, 
                search, 
                limit = 100, 
                offset = 0, 
                active_only = true,
                include_coordinates = false 
            } = req.query;
            
            let selectFields = `
                ct.city_code,
                ct.city_name,
                ct.city_name_local,
                ct.state_code,
                s.state_name,
                ct.country_code,
                c.country_name,
                ct.postal_code,
                ct.is_active
            `;
            
            if (include_coordinates) {
                selectFields += ', ct.latitude, ct.longitude';
            }
            
            let query = `
                SELECT ${selectFields}
                FROM CITY ct
                INNER JOIN STATE s ON ct.state_code = s.state_code
                INNER JOIN COUNTRY c ON ct.country_code = c.country_code
                WHERE 1=1
            `;
            
            const params = [];
            
            if (active_only) {
                query += ' AND ct.is_active = TRUE AND s.is_active = TRUE AND c.is_active = TRUE';
            }
            
            if (state_code) {
                query += ' AND ct.state_code = ?';
                params.push(state_code);
            }
            
            if (country_code) {
                query += ' AND ct.country_code = ?';
                params.push(country_code);
            }
            
            if (search) {
                query += ' AND (ct.city_name LIKE ? OR ct.city_code LIKE ? OR ct.postal_code LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            
            // Count total for pagination
            const countQuery = query.replace(selectFields, 'COUNT(*) as total');
            const [countResult] = await req.db.query(countQuery, params);
            const total = countResult[0].total;
            
            query += ' ORDER BY c.country_name ASC, s.state_name ASC, ct.city_name ASC';
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                cities: rows,
                pagination: {
                    total,
                    limit,
                    offset,
                    has_more: offset + limit < total
                },
                filters: {
                    state_code: state_code || null,
                    country_code: country_code || null,
                    search: search || null,
                    active_only,
                    include_coordinates
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Cities API error:', error);
            res.status(500).json({ error: 'Failed to fetch cities' });
        }
    }
);

/**
 * GET /api/reference/cities/:stateCode
 * Returns all cities for a specific state
 */
router.get('/cities/:stateCode', 
    cacheMiddleware('cities_by_state'),
    [
        query('search').optional().isLength({ max: 100 }).trim(),
        query('active_only').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const { stateCode } = req.params;
            const { search, active_only = true } = req.query;
            
            let query = `
                SELECT 
                    city_code,
                    city_name,
                    city_name_local,
                    postal_code,
                    is_major_city,
                    population,
                    is_active
                FROM CITY 
                WHERE state_code = ?
            `;
            
            const params = [stateCode];
            
            if (active_only) {
                query += ' AND is_active = TRUE';
            }
            
            if (search) {
                query += ' AND (city_name LIKE ? OR city_code LIKE ? OR postal_code LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            
            query += ' ORDER BY is_major_city DESC, city_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                state_code: stateCode,
                cities: rows,
                total: rows.length,
                filters: {
                    search: search || null,
                    active_only
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Cities by state API error:', error);
            res.status(500).json({ error: 'Failed to fetch cities for state' });
        }
    }
);

// ============================================================================
// CIVIL STATUS API
// ============================================================================

/**
 * GET /api/reference/civil-status
 * Returns all civil status types
 */
router.get('/civil-status', 
    cacheMiddleware('civil_status'),
    async (req, res) => {
        try {
            const [rows] = await req.db.query(`
                SELECT 
                    civil_status_code,
                    civil_status_description,
                    is_active,
                    sort_order
                FROM CIVIL_STATUS_TYPE 
                WHERE is_active = TRUE
                ORDER BY sort_order ASC, civil_status_description ASC
            `);
            
            const response = {
                civil_status_types: rows,
                total: rows.length
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Civil status API error:', error);
            res.status(500).json({ error: 'Failed to fetch civil status types' });
        }
    }
);

// ============================================================================
// ADDRESS TYPES API
// ============================================================================

/**
 * GET /api/reference/address-types
 * Returns all address types
 */
router.get('/address-types', 
    cacheMiddleware('address_types'),
    async (req, res) => {
        try {
            const [rows] = await req.db.query(`
                SELECT 
                    address_type_code,
                    address_type_description,
                    is_primary_eligible,
                    requires_verification,
                    is_active,
                    sort_order
                FROM ADDRESS_TYPE 
                WHERE is_active = TRUE
                ORDER BY sort_order ASC, address_type_description ASC
            `);
            
            const response = {
                address_types: rows,
                total: rows.length
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Address types API error:', error);
            res.status(500).json({ error: 'Failed to fetch address types' });
        }
    }
);

// ============================================================================
// ACCOUNT TYPES API
// ============================================================================

/**
 * GET /api/reference/account-types
 * Returns all available account types
 */
router.get('/account-types', 
    cacheMiddleware('account_types'),
    [
        query('customer_type').optional().isIn(['individual', 'business']).trim(),
        query('include_requirements').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const { customer_type, include_requirements = false } = req.query;
            
            let query = `
                SELECT 
                    account_type_code,
                    account_type_name,
                    account_type_description,
                    min_initial_deposit,
                    min_maintaining_balance,
                    monthly_fee,
                    customer_eligibility,
                    features,
                    is_active,
                    sort_order
                FROM ACCOUNT_TYPE 
                WHERE is_active = TRUE
            `;
            
            const params = [];
            
            if (customer_type) {
                query += ' AND (customer_eligibility = ? OR customer_eligibility = "both")';
                params.push(customer_type);
            }
            
            if (include_requirements) {
                query = query.replace('sort_order', 'requirements, documentation_needed, sort_order');
            }
            
            query += ' ORDER BY sort_order ASC, account_type_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                account_types: rows.map(row => ({
                    ...row,
                    features: row.features ? JSON.parse(row.features) : [],
                    requirements: include_requirements && row.requirements ? JSON.parse(row.requirements) : undefined,
                    documentation_needed: include_requirements && row.documentation_needed ? JSON.parse(row.documentation_needed) : undefined
                })),
                total: rows.length,
                filters: {
                    customer_type: customer_type || null,
                    include_requirements
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Account types API error:', error);
            res.status(500).json({ error: 'Failed to fetch account types' });
        }
    }
);

// ============================================================================
// ID TYPES API
// ============================================================================

/**
 * GET /api/reference/id-types
 * Returns all valid identification types
 */
router.get('/id-types', 
    cacheMiddleware('id_types'),
    [
        query('country_code').optional().isLength({ min: 2, max: 3 }).trim(),
        query('is_primary_eligible').optional().isBoolean().toBoolean()
    ],
    async (req, res) => {
        try {
            const { country_code, is_primary_eligible } = req.query;
            
            let query = `
                SELECT 
                    id_type_code,
                    id_type_name,
                    id_type_description,
                    issuing_country,
                    is_government_issued,
                    is_primary_eligible,
                    has_expiry,
                    verification_requirements,
                    format_pattern,
                    is_active,
                    sort_order
                FROM ID_TYPE 
                WHERE is_active = TRUE
            `;
            
            const params = [];
            
            if (country_code) {
                query += ' AND (issuing_country = ? OR issuing_country IS NULL)';
                params.push(country_code);
            }
            
            if (typeof is_primary_eligible === 'boolean') {
                query += ' AND is_primary_eligible = ?';
                params.push(is_primary_eligible);
            }
            
            query += ' ORDER BY sort_order ASC, id_type_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                id_types: rows.map(row => ({
                    ...row,
                    verification_requirements: row.verification_requirements ? JSON.parse(row.verification_requirements) : []
                })),
                total: rows.length,
                filters: {
                    country_code: country_code || null,
                    is_primary_eligible: is_primary_eligible || null
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('ID types API error:', error);
            res.status(500).json({ error: 'Failed to fetch ID types' });
        }
    }
);

// ============================================================================
// EMPLOYMENT POSITIONS API
// ============================================================================

/**
 * GET /api/reference/employment-positions
 * Returns all employment position types
 */
router.get('/employment-positions', 
    cacheMiddleware('employment_positions'),
    [
        query('category').optional().isIn(['executive', 'management', 'professional', 'technical', 'clerical', 'labor']).trim(),
        query('search').optional().isLength({ max: 100 }).trim()
    ],
    async (req, res) => {
        try {
            const { category, search } = req.query;
            
            let query = `
                SELECT 
                    position_code,
                    position_name,
                    position_description,
                    position_category,
                    typical_salary_range,
                    is_active,
                    sort_order
                FROM EMPLOYMENT_POSITION 
                WHERE is_active = TRUE
            `;
            
            const params = [];
            
            if (category) {
                query += ' AND position_category = ?';
                params.push(category);
            }
            
            if (search) {
                query += ' AND (position_name LIKE ? OR position_description LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            
            query += ' ORDER BY position_category ASC, sort_order ASC, position_name ASC';
            
            const [rows] = await req.db.query(query, params);
            
            const response = {
                employment_positions: rows,
                total: rows.length,
                filters: {
                    category: category || null,
                    search: search || null
                }
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Employment positions API error:', error);
            res.status(500).json({ error: 'Failed to fetch employment positions' });
        }
    }
);

// ============================================================================
// FUND SOURCES API
// ============================================================================

/**
 * GET /api/reference/fund-sources
 * Returns all fund source types
 */
router.get('/fund-sources', 
    cacheMiddleware('fund_sources'),
    async (req, res) => {
        try {
            const [rows] = await req.db.query(`
                SELECT 
                    fund_source_code,
                    fund_source_description,
                    requires_documentation,
                    risk_level,
                    compliance_requirements,
                    is_active,
                    sort_order
                FROM FUND_SOURCE 
                WHERE is_active = TRUE
                ORDER BY sort_order ASC, fund_source_description ASC
            `);
            
            const response = {
                fund_sources: rows.map(row => ({
                    ...row,
                    compliance_requirements: row.compliance_requirements ? JSON.parse(row.compliance_requirements) : []
                })),
                total: rows.length
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Fund sources API error:', error);
            res.status(500).json({ error: 'Failed to fetch fund sources' });
        }
    }
);

// ============================================================================
// CONTACT TYPES API
// ============================================================================

/**
 * GET /api/reference/contact-types
 * Returns all contact types
 */
router.get('/contact-types', 
    cacheMiddleware('contact_types'),
    async (req, res) => {
        try {
            const [rows] = await req.db.query(`
                SELECT 
                    contact_type_code,
                    contact_type_description,
                    validation_pattern,
                    is_required_for_registration,
                    is_active,
                    sort_order
                FROM CONTACT_TYPE 
                WHERE is_active = TRUE
                ORDER BY sort_order ASC, contact_type_description ASC
            `);
            
            const response = {
                contact_types: rows,
                total: rows.length
            };
            
            res.sendCachedResponse ? res.sendCachedResponse(response) : res.json(response);
            
        } catch (error) {
            console.error('Contact types API error:', error);
            res.status(500).json({ error: 'Failed to fetch contact types' });
        }
    }
);

// ============================================================================
// BULK REFERENCE DATA API
// ============================================================================

/**
 * GET /api/reference/bulk
 * Returns multiple reference data types in a single request
 */
router.get('/bulk', 
    cacheMiddleware('reference_bulk'),
    [
        query('types').custom((value) => {
            const validTypes = [
                'countries', 'states', 'cities', 'civil-status', 'address-types',
                'account-types', 'id-types', 'employment-positions', 'fund-sources', 'contact-types'
            ];
            const requestedTypes = value.split(',');
            return requestedTypes.every(type => validTypes.includes(type.trim()));
        }).withMessage('Invalid reference data types requested'),
        query('country_code').optional().isLength({ min: 2, max: 3 }).trim(),
        query('state_code').optional().isLength({ min: 2, max: 5 }).trim()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { types, country_code, state_code } = req.query;
            const requestedTypes = types.split(',').map(t => t.trim());
            
            const result = {
                data: {},
                filters: {
                    country_code: country_code || null,
                    state_code: state_code || null
                },
                requested_types: requestedTypes,
                timestamp: new Date().toISOString()
            };
            
            // Fetch each requested reference data type
            for (const type of requestedTypes) {
                try {
                    switch (type) {
                        case 'countries':
                            const [countries] = await req.db.query('SELECT * FROM COUNTRY WHERE is_active = TRUE ORDER BY country_name');
                            result.data.countries = countries;
                            break;
                            
                        case 'states':
                            let statesQuery = 'SELECT * FROM STATE WHERE is_active = TRUE';
                            const statesParams = [];
                            if (country_code) {
                                statesQuery += ' AND country_code = ?';
                                statesParams.push(country_code);
                            }
                            statesQuery += ' ORDER BY state_name';
                            const [states] = await req.db.query(statesQuery, statesParams);
                            result.data.states = states;
                            break;
                            
                        case 'cities':
                            let citiesQuery = 'SELECT * FROM CITY WHERE is_active = TRUE';
                            const citiesParams = [];
                            if (state_code) {
                                citiesQuery += ' AND state_code = ?';
                                citiesParams.push(state_code);
                            } else if (country_code) {
                                citiesQuery += ' AND country_code = ?';
                                citiesParams.push(country_code);
                            }
                            citiesQuery += ' ORDER BY city_name LIMIT 500'; // Limit for performance
                            const [cities] = await req.db.query(citiesQuery, citiesParams);
                            result.data.cities = cities;
                            break;
                            
                        case 'civil-status':
                            const [civilStatus] = await req.db.query('SELECT * FROM CIVIL_STATUS_TYPE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.civil_status = civilStatus;
                            break;
                            
                        case 'address-types':
                            const [addressTypes] = await req.db.query('SELECT * FROM ADDRESS_TYPE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.address_types = addressTypes;
                            break;
                            
                        case 'account-types':
                            const [accountTypes] = await req.db.query('SELECT * FROM ACCOUNT_TYPE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.account_types = accountTypes;
                            break;
                            
                        case 'id-types':
                            const [idTypes] = await req.db.query('SELECT * FROM ID_TYPE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.id_types = idTypes;
                            break;
                            
                        case 'employment-positions':
                            const [employmentPositions] = await req.db.query('SELECT * FROM EMPLOYMENT_POSITION WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.employment_positions = employmentPositions;
                            break;
                            
                        case 'fund-sources':
                            const [fundSources] = await req.db.query('SELECT * FROM FUND_SOURCE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.fund_sources = fundSources;
                            break;
                            
                        case 'contact-types':
                            const [contactTypes] = await req.db.query('SELECT * FROM CONTACT_TYPE WHERE is_active = TRUE ORDER BY sort_order');
                            result.data.contact_types = contactTypes;
                            break;
                    }
                } catch (typeError) {
                    console.error(`Error fetching ${type}:`, typeError);
                    result.data[type] = { error: `Failed to fetch ${type}` };
                }
            }
            
            res.sendCachedResponse ? res.sendCachedResponse(result) : res.json(result);
            
        } catch (error) {
            console.error('Bulk reference data API error:', error);
            res.status(500).json({ error: 'Failed to fetch bulk reference data' });
        }
    }
);

// ============================================================================
// CACHE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/reference/cache/clear
 * Clears reference data cache (admin only)
 */
router.post('/cache/clear', async (req, res) => {
    try {
        const { pattern } = req.body;
        clearCache(pattern);
        
        res.json({
            message: 'Cache cleared successfully',
            pattern: pattern || 'all',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

/**
 * GET /api/reference/cache/info
 * Returns cache information and statistics
 */
router.get('/cache/info', (req, res) => {
    try {
        const cacheInfo = {
            total_entries: cache.size,
            entries: Array.from(cache.keys()).map(key => ({
                key,
                timestamp: cache.get(key).timestamp,
                age_ms: Date.now() - cache.get(key).timestamp
            })),
            memory_usage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        
        res.json(cacheInfo);
        
    } catch (error) {
        console.error('Cache info error:', error);
        res.status(500).json({ error: 'Failed to get cache information' });
    }
});

module.exports = router;
