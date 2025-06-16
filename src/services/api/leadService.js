import leadsData from '../mockData/leads.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let leads = [...leadsData];

const leadService = {
  async getAll() {
    await delay(300);
    return [...leads];
  },

  async getById(id) {
    await delay(200);
    const lead = leads.find(l => l.Id === parseInt(id, 10));
    if (!lead) {
      throw new Error('Lead not found');
    }
    return { ...lead };
  },

  async create(leadData) {
    await delay(400);
    const maxId = leads.length > 0 ? Math.max(...leads.map(l => l.Id)) : 0;
    const newLead = {
      ...leadData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay(350);
    const index = leads.findIndex(l => l.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    
    const updatedLead = {
      ...leads[index],
      ...leadData,
      Id: leads[index].Id // Prevent Id modification
    };
    
    leads[index] = updatedLead;
    return { ...updatedLead };
  },

  async delete(id) {
    await delay(250);
    const index = leads.findIndex(l => l.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    
    const deletedLead = { ...leads[index] };
    leads.splice(index, 1);
    return deletedLead;
  },

  async getByStage(stage) {
    await delay(200);
    return leads.filter(lead => lead.stage === stage).map(lead => ({ ...lead }));
  }
};

export default leadService;