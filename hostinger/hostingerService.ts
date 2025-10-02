// Service Hostinger - src/services/hostingerService.ts
import { Customer, Order, Service, Employee, InventoryItem, Invoice } from '../types';

const API_BASE_URL = import.meta.env.VITE_HOSTINGER_API_URL || 'https://votre-domaine.com/api';

class HostingerService {
  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options, headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
  async getCustomers() { return this.request('/customers'); }
  async createCustomer(data: any) { return this.request('/customers', { method: 'POST', body: JSON.stringify(data) }); }
  async updateCustomer(id: string, data: any) { return this.request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteCustomer(id: string) { return this.request(`/customers/${id}`, { method: 'DELETE' }); }
  async getOrders() { return this.request('/orders'); }
  async createOrder(data: any) { return this.request('/orders', { method: 'POST', body: JSON.stringify(data) }); }
  async updateOrder(id: string, data: any) { return this.request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteOrder(id: string) { return this.request(`/orders/${id}`, { method: 'DELETE' }); }
  async getServices() { return this.request('/services'); }
  async getEmployees() { return this.request('/employees'); }
  async getInventory() { return this.request('/inventory'); }
  async updateInventoryItem(id: string, data: any) { return this.request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async getInvoices() { return this.request('/invoices'); }
}
export const hostingerService = new HostingerService();
