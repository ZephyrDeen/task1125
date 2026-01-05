import { readFile, writeFile } from 'node:fs/promises';

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV with quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }

  return data;
}

async function main() {
  // Read CSV files
  const companiesCSV = await readFile(new URL('../public/companies_1217.csv', import.meta.url), 'utf-8');
  const relationsCSV = await readFile(new URL('../public/relationships_1217.csv', import.meta.url), 'utf-8');

  // Parse CSV
  const companies = parseCSV(companiesCSV);
  const relations = parseCSV(relationsCSV);

  console.log(`Loaded ${companies.length} companies and ${relations.length} relationships`);

  // Create company map for quick lookup
  const companyMap = new Map();
  companies.forEach(company => {
    companyMap.set(company.company_code, {
      company_code: company.company_code,
      company_name: company.company_name,
      level: parseInt(company.level) || 0,
      country: company.country,
      city: company.city,
      founded_year: parseInt(company.founded_year) || 0,
      annual_revenue: parseInt(company.annual_revenue) || 0,
      employees: parseInt(company.employees) || 0,
    });
  });

  // Build parent-child relationships
  const childrenMap = new Map(); // parent_code -> [child_codes]
  let rootCode = null;

  relations.forEach(rel => {
    const childCode = rel.company_code;
    const parentCode = rel.parent_company;

    if (!parentCode || parentCode === '') {
      // This is the root company
      rootCode = childCode;
    } else {
      if (!childrenMap.has(parentCode)) {
        childrenMap.set(parentCode, []);
      }
      childrenMap.get(parentCode).push(childCode);
    }
  });

  console.log(`Root company: ${rootCode}`);

  // Build hierarchical structure recursively
  function buildHierarchy(companyCode) {
    const company = companyMap.get(companyCode);
    if (!company) {
      console.warn(`Company not found: ${companyCode}`);
      return null;
    }

    const children = childrenMap.get(companyCode) || [];

    if (children.length === 0) {
      // Leaf node - use employees as value
      return {
        name: company.company_name,
        code: company.company_code,
        level: company.level,
        country: company.country,
        city: company.city,
        value: company.employees || 1, // Use employees as size
        employees: company.employees,
        revenue: company.annual_revenue,
      };
    }

    // Non-leaf node - has children
    return {
      name: company.company_name,
      code: company.company_code,
      level: company.level,
      country: company.country,
      city: company.city,
      employees: company.employees,
      revenue: company.annual_revenue,
      children: children
        .map(childCode => buildHierarchy(childCode))
        .filter(Boolean)
        .sort((a, b) => (b.employees || 0) - (a.employees || 0)),
    };
  }

  const hierarchy = buildHierarchy(rootCode);

  // Also save flat companies array for other uses
  const flatCompanies = Array.from(companyMap.values());

  // Write output files
  await writeFile(
    new URL('../public/company-hierarchy.json', import.meta.url),
    JSON.stringify(hierarchy, null, 2)
  );
  console.log('Generated public/company-hierarchy.json');

  await writeFile(
    new URL('../public/companies.json', import.meta.url),
    JSON.stringify(flatCompanies, null, 2)
  );
  console.log(`Generated public/companies.json with ${flatCompanies.length} records`);

  // Print some stats
  function countNodes(node) {
    if (!node) return 0;
    if (!node.children) return 1;
    return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
  }

  function getDepth(node, depth = 0) {
    if (!node || !node.children) return depth;
    return Math.max(...node.children.map(child => getDepth(child, depth + 1)));
  }

  console.log(`Hierarchy has ${countNodes(hierarchy)} total nodes`);
  console.log(`Maximum depth: ${getDepth(hierarchy)}`);
}

main().catch(error => {
  console.error('Conversion failed:', error);
  process.exit(1);
});
