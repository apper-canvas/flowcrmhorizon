import companiesData from '../mockData/companies.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let companies = [...companiesData];

const companyService = {
  async getAll() {
    await delay(300);
    return [...companies];
  },

  async getById(id) {
    await delay(200);
    const company = companies.find(c => c.Id === parseInt(id, 10));
    if (!company) {
      throw new Error('Company not found');
    }
    return { ...company };
  },

  async create(companyData) {
    await delay(400);
    const maxId = companies.length > 0 ? Math.max(...companies.map(c => c.Id)) : 0;
    const newCompany = {
      ...companyData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    companies.push(newCompany);
    return { ...newCompany };
  },

  async update(id, companyData) {
    await delay(350);
    const index = companies.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    const updatedCompany = {
      ...companies[index],
      ...companyData,
      Id: companies[index].Id // Prevent Id modification
    };
    
    companies[index] = updatedCompany;
    return { ...updatedCompany };
  },

  async delete(id) {
    await delay(250);
    const index = companies.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Company not found');
    }
    
    const deletedCompany = { ...companies[index] };
    companies.splice(index, 1);
    return deletedCompany;
  }
};

export default companyService;