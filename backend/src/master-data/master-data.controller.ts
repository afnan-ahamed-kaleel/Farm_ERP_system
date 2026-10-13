import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MasterDataService } from './master-data.service.js';

@Controller('api/v1/master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  // 1. Locations
  @Get('locations')
  async getLocations() {
    return this.masterDataService.getLocations();
  }

  @Post('locations')
  async createLocation(@Body() body: { name: string; type: string; parentId?: string }) {
    return this.masterDataService.createLocation(body);
  }

  @Put('locations/:id')
  async updateLocation(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: string; parentId?: string },
  ) {
    return this.masterDataService.updateLocation(id, body);
  }

  @Delete('locations/:id')
  async deleteLocation(@Param('id') id: string) {
    return this.masterDataService.deleteLocation(id);
  }

  // 2. Flocks
  @Get('flocks')
  async getFlocks() {
    return this.masterDataService.getFlocks();
  }

  @Post('flocks')
  async createFlock(@Body() body: { batchNumber: string; breed: string; hatchDate: string }) {
    return this.masterDataService.createFlock(body);
  }

  @Put('flocks/:id')
  async updateFlock(
    @Param('id') id: string,
    @Body() body: { batchNumber?: string; breed?: string; hatchDate?: string },
  ) {
    return this.masterDataService.updateFlock(id, body);
  }

  @Delete('flocks/:id')
  async deleteFlock(@Param('id') id: string) {
    return this.masterDataService.deleteFlock(id);
  }

  // 3. Items
  @Get('items')
  async getItems(@Query('category') category?: string) {
    return this.masterDataService.getItems(category);
  }

  @Post('items')
  async createItem(@Body() body: { code: string; name: string; category: string; primaryUom: string }) {
    return this.masterDataService.createItem(body);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() body: { name?: string; category?: string; primaryUom?: string },
  ) {
    return this.masterDataService.updateItem(id, body);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    return this.masterDataService.deleteItem(id);
  }

  // 4. Commercial Partners
  @Get('customers')
  async getCustomers() {
    return this.masterDataService.getCustomers();
  }

  @Post('customers')
  async createCustomer(@Body() body: { name: string; contactNumber?: string; address?: string }) {
    return this.masterDataService.createCustomer(body);
  }

  @Put('customers/:id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() body: { name?: string; contactNumber?: string; address?: string },
  ) {
    return this.masterDataService.updateCustomer(id, body);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.masterDataService.deleteCustomer(id);
  }

  @Get('suppliers')
  async getSuppliers() {
    return this.masterDataService.getSuppliers();
  }

  @Post('suppliers')
  async createSupplier(@Body() body: { name: string; type?: string; contactNumber?: string; address?: string }) {
    return this.masterDataService.createSupplier(body);
  }

  @Put('suppliers/:id')
  async updateSupplier(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: string; contactNumber?: string; address?: string },
  ) {
    return this.masterDataService.updateSupplier(id, body);
  }

  @Delete('suppliers/:id')
  async deleteSupplier(@Param('id') id: string) {
    return this.masterDataService.deleteSupplier(id);
  }

  // 5. Operational Reasons
  @Get('reasons')
  async getOperationalReasons(@Query('category') category?: string) {
    return this.masterDataService.getOperationalReasons(category);
  }

  @Post('reasons')
  async createOperationalReason(@Body() body: { category: string; code: string; name: string; description?: string }) {
    return this.masterDataService.createOperationalReason(body);
  }

  @Delete('reasons/:id')
  async deleteOperationalReason(@Param('id') id: string) {
    return this.masterDataService.deleteOperationalReason(id);
  }
}
