const axios = require('axios');

const POSTEX_BASE_URL = 'https://api.postex.pk/services/integration/api/order';

const getHeaders = () => {
  return {
    token: process.env.POSTEX_API_TOKEN,
    'Content-Type': 'application/json'
  };
};

// Phase 1: Operational Cities API
exports.getOperationalCities = async () => {
  try {
    const response = await axios.get(`${POSTEX_BASE_URL}/v2/get-operational-city`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('PostEx API Error [getOperationalCities]:', error.response?.data || error.message);
    throw error;
  }
};

// Phase 1: Order Creation API
exports.createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${POSTEX_BASE_URL}/v3/create-order`, orderData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('PostEx API Error [createOrder]:', error.response?.data || error.message);
    throw error;
  }
};

// Phase 3: Bulk Tracking API
exports.trackBulkOrders = async (trackingNumbersArray) => {
  try {
    // Vercel strips GET bodies, so we must use POST. If PostEx supports POST for this, it will work.
    const response = await axios.post(`${POSTEX_BASE_URL}/v1/track-bulk-order`, 
      { trackingNumber: trackingNumbersArray }, 
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('PostEx API Error [trackBulkOrders]:', error.response?.data || error.message);
    throw error;
  }
};

// Phase 3: Get Invoice / Airway Bill API
exports.getInvoice = async (trackingNumbersCommaSeparated) => {
  try {
    const response = await axios.get(`${POSTEX_BASE_URL}/v1/get-invoice`, {
      headers: getHeaders(),
      params: { trackingNumbers: trackingNumbersCommaSeparated },
      responseType: 'arraybuffer' 
    });
    return response.data;
  } catch (error) {
    console.error('PostEx API Error [getInvoice]:', error.response?.data || error.message);
    throw error;
  }
};
