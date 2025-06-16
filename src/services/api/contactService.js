import { toast } from 'react-toastify';

const contactService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        Fields: ['Name', 'first_name', 'last_name', 'email', 'phone', 'position', 'notes', 'created_at', 'updated_at', 'company_id']
      };

      const response = await apperClient.fetchRecords('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: ['Name', 'first_name', 'last_name', 'email', 'phone', 'position', 'notes', 'created_at', 'updated_at', 'company_id']
      };

      const response = await apperClient.getRecordById('contact', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      throw error;
    }
  },

  async create(contactData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: `${contactData.firstName} ${contactData.lastName}`,
          first_name: contactData.firstName,
          last_name: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          position: contactData.position,
          notes: contactData.notes,
          company_id: contactData.companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      };

      const response = await apperClient.createRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  },

  async update(id, contactData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id, 10),
          Name: `${contactData.firstName} ${contactData.lastName}`,
          first_name: contactData.firstName,
          last_name: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          position: contactData.position,
          notes: contactData.notes,
          company_id: contactData.companyId,
          updated_at: new Date().toISOString()
        }]
      };

      const response = await apperClient.updateRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return response.results.length > 0 && response.results[0].success;
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },

  async search(query) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        Fields: ['Name', 'first_name', 'last_name', 'email', 'phone', 'position', 'notes', 'created_at', 'updated_at', 'company_id'],
        whereGroups: [{
          operator: "OR",
          SubGroups: [
            {
              conditions: [{
                FieldName: "first_name",
                Operator: "Contains",
                Values: [query]
              }],
              operator: ""
            },
            {
              conditions: [{
                FieldName: "last_name",
                Operator: "Contains",
                Values: [query]
              }],
              operator: ""
            },
            {
              conditions: [{
                FieldName: "email",
                Operator: "Contains",
                Values: [query]
              }],
              operator: ""
            }
          ]
        }]
      };

      const response = await apperClient.fetchRecords('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  }
};

export default contactService;