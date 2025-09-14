import axios from "axios";

/**
 * Fetch data from Shopify Admin API
 * @param shopDomain - store domain like "your-store.myshopify.com"
 * @param accessToken - private app or custom app access token
 * @param resource - "customers" | "products" | "orders"
 */
export const fetchShopifyData = async (
  shopDomain: string,
  accessToken: string,
  resource: "customers" | "products" | "orders"
) => {
  const url = `https://${shopDomain}/admin/api/2023-10/${resource}.json?limit=50`;

  try {
    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch ${resource} from Shopify:`, {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data,
    });

    throw new Error(
      `Shopify API request failed for resource ${resource}: ${error.response?.status || error.message}`
    );
  }
};
