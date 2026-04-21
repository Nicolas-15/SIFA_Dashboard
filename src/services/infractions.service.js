import mockData from '../utils/mockInfractions.json';

export const getInfractions = async () => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData.infractions || mockData;
};

export const updateInfractionStatus = async (id, newStatus) => {
  // Simular delay y retornar ok
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

export const updateInfractionData = async (id, updatedFields) => {
  // Simular delay y retornar ok
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};
