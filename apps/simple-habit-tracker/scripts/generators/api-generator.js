const {
  say,
  template,
  resetTracking,
  showSummary,
  toPascalCase,
  toCamelCase,
  singularize,
  pluralize
} = require('./generator-utils');

/**
 * API Generator
 * Generates TypeScript service and type files for API endpoints
 *
 * Usage: npm run gen api posts index show create update
 *        npm run gen api posts  # generates all CRUD actions
 */

function generateApi(resourceName, options = []) {
  const actions = options;

  // Use default CRUD actions if none specified
  const defaultActions = ['index', 'show', 'create', 'update', 'destroy'];
  const selectedActions = actions.length > 0 ? actions : defaultActions;

  say(`\nGenerating API client for '${resourceName}'...`, 'cyan');
  say(`Actions: ${selectedActions.join(', ')}`, 'cyan');

  const singular = singularize(resourceName);
  const plural = pluralize(resourceName);
  const SingularType = toPascalCase(singular);
  const PluralType = toPascalCase(plural);
  const serviceName = toCamelCase(plural);

  // Generate TypeScript types file
  function generateTypesFile() {
  const typesPath = `types/${plural}.ts`;

  return template('types.ts.template', typesPath, {
    SingularType,
    singular,
    PluralType
  }, { skip: true }, 'api');
  }

  // Generate store file
  function generateStoreFile() {
    const storePath = `stores/${serviceName}Store.ts`;

    return template('store.ts.template', storePath, {
      PluralType,
      SingularType,
      plural,
      singular,
      serviceName
    }, { skip: true }, 'api');
  }

  // Generate service file
  function generateServiceFile() {
  const methods = [];

  if (selectedActions.includes('index')) {
    methods.push(`
  /**
   * Get all ${plural}
   */
  async getAll(): Promise<${PluralType}Response> {
    return api.get<${PluralType}Response>(\`\${API_BASE_URL}/api/v1/${plural}\`);
  }`);
  }

  if (selectedActions.includes('show')) {
    methods.push(`
  /**
   * Get a single ${singular} by ID
   */
  async getById(id: number): Promise<${SingularType}Response> {
    return api.get<${SingularType}Response>(\`\${API_BASE_URL}/api/v1/${plural}/\${id}\`);
  }`);
  }

  if (selectedActions.includes('create')) {
    methods.push(`
  /**
   * Create a new ${singular}
   * Supports both JSON and FormData (for file uploads)
   */
  async create(data: Create${SingularType}Input | FormData): Promise<${SingularType}Response> {
    return api.post<${SingularType}Response>(\`\${API_BASE_URL}/api/v1/${plural}\`, data);
  }`);
  }

  if (selectedActions.includes('update')) {
    methods.push(`
  /**
   * Update an existing ${singular}
   * Supports both JSON and FormData (for file uploads)
   */
  async update(id: number, data: Update${SingularType}Input | FormData): Promise<${SingularType}Response> {
    return api.put<${SingularType}Response>(\`\${API_BASE_URL}/api/v1/${plural}/\${id}\`, data);
  }`);
  }

  if (selectedActions.includes('destroy') || selectedActions.includes('delete')) {
    methods.push(`
  /**
   * Delete a ${singular}
   */
  async delete(id: number): Promise<void> {
    return api.delete<void>(\`\${API_BASE_URL}/api/v1/${plural}/\${id}\`);
  }`);
  }

  const servicePath = `services/${plural}.ts`;

  return template('service.ts.template', servicePath, {
    PluralType,
    SingularType,
    plural,
    serviceName,
    methods: methods.join('\n')
  }, { skip: true }, 'api');
  }

  // Main generation flow
  resetTracking();

  say('\nGenerating files...', 'cyan');

  // 1. Generate types file
  generateTypesFile();

  // 2. Generate service file
  generateServiceFile();

  // 3. Generate store file
  generateStoreFile();

  // Show summary
  const nextSteps = [
    `Edit types/${plural}.ts to add your ${singular} fields`,
    `List: const { items, loading, fetchAll } = use${PluralType}Store();`,
    `Create: const addItem = use${PluralType}Store(s => s.addItem); await addItem(data);`,
    `Update: const updateItem = use${PluralType}Store(s => s.updateItem); await updateItem(id, data);`,
    `Delete: const removeItem = use${PluralType}Store(s => s.removeItem); await removeItem(id);`,
    `Backend: rails g controller api::v1::${plural} ${selectedActions.join(' ')}`
  ];

  showSummary({
    title: `API client for '${resourceName}' generated successfully!`,
    nextSteps
  });
}

module.exports = generateApi;
