import axios from "axios";

const API_URL = "http://localhost:8080/metrics";

export const getMetricData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};