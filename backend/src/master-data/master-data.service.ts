import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  // ===================== 1. LOCATIONS / HOUSES =====================
  async getLocations() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async createLocation(data: { name: string; type: string; parentId?: string }) {
    if (!data.name || !data.type) {
      throw new BadRequestException('Name and Type are required for Location');
    }
    return this.prisma.location.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase(),
        parentId: data.parentId || null,
      },
    });
  }

  async updateLocation(id: string, data: { name?: string; type?: string; parentId?: string }) {
    return this.prisma.location.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type.toUpperCase() }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
      },
    });
  }

  async deleteLocation(id: string) {
    return this.prisma.location.delete({ where: { id } });
  }

  // ===================== 2. FLOCKS & BREEDS =====================
  async getFlocks() {
    return this.prisma.flock.findMany({
      orderBy: { hatchDate: 'desc' },
      include: {
        movements: {
          where: { status: 'POSTED' },
          select: { quantity: true, pathway: true },
        },
        mortalities: {
          select: { mortalityCount: true, cullingCount: true },
        },
      },
    });
  }

  async createFlock(data: { batchNumber: string; breed: string; hatchDate: string }) {
    if (!data.batchNumber || !data.breed) {
      throw new BadRequestException('Batch number and breed are required');
    }
    return this.prisma.flock.create({
      data: {
        batchNumber: data.batchNumber.trim().toUpperCase(),
        breed: data.breed.trim(),
        hatchDate: data.hatchDate ? new Date(data.hatchDate) : new Date(),
      },
    });
  }

  async updateFlock(id: string, data: { batchNumber?: string; breed?: string; hatchDate?: string }) {
    return this.prisma.flock.update({
      where: { id },
      data: {
        ...(data.batchNumber && { batchNumber: data.batchNumber.trim().toUpperCase() }),
        ...(data.breed && { breed: data.breed.trim() }),
        ...(data.hatchDate && { hatchDate: new Date(data.hatchDate) }),
      },
    });
  }

  async deleteFlock(id: string) {
    return this.prisma.flock.delete({ where: { id } });
  }

  // ===================== 3. ITEM & CATALOG =====================
  async getItems(category?: string) {
    return this.prisma.item.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createItem(data: { code: string; name: string; category: string; primaryUom: string }) {
    if (!data.code || !data.name || !data.category || !data.primaryUom) {
      throw new BadRequestException('Code, Name, Category, and Primary UOM are required');
    }
    return this.prisma.item.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        category: data.category as any,
        primaryUom: data.primaryUom.trim().toUpperCase(),
      },
    });
  }

  async updateItem(id: string, data: { name?: string; category?: string; primaryUom?: string }) {
    return this.prisma.item.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.category && { category: data.category as any }),
        ...(data.primaryUom && { primaryUom: data.primaryUom.trim().toUpperCase() }),
      },
    });
  }

  async deleteItem(id: string) {
    return this.prisma.item.delete({ where: { id } });
  }

  // ===================== 4. COMMERCIAL PARTNERS (CUSTOMERS & SUPPLIERS) =====================
  async getCustomers() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCustomer(data: { name: string; contactNumber?: string; address?: string }) {
    if (!data.name) throw new BadRequestException('Customer name is required');
    return this.prisma.customer.create({
      data: {
        name: data.name.trim(),
        contactNumber: data.contactNumber?.trim() || null,
        address: data.address?.trim() || null,
      },
    });
  }

  async updateCustomer(id: string, data: { name?: string; contactNumber?: string; address?: string }) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.contactNumber !== undefined && { contactNumber: data.contactNumber?.trim() || null }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
      },
    });
  }

  async deleteCustomer(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async getSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(data: { name: string; type?: string; contactNumber?: string; address?: string }) {
    if (!data.name) throw new BadRequestException('Supplier name is required');
    return this.prisma.supplier.create({
      data: {
        name: data.name.trim(),
        type: (data.type || 'HATCHERY').trim().toUpperCase(),
        contactNumber: data.contactNumber?.trim() || null,
        address: data.address?.trim() || null,
      },
    });
  }

  async updateSupplier(id: string, data: { name?: string; type?: string; contactNumber?: string; address?: string }) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type.trim().toUpperCase() }),
        ...(data.contactNumber !== undefined && { contactNumber: data.contactNumber?.trim() || null }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
      },
    });
  }

  async deleteSupplier(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  // ===================== 5. OPERATIONAL REASONS & MORTALITY CAUSES =====================
  async getOperationalReasons(category?: string) {
    return this.prisma.operationalReason.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createOperationalReason(data: { category: string; code: string; name: string; description?: string }) {
    if (!data.category || !data.code || !data.name) {
      throw new BadRequestException('Category, Code, and Name are required');
    }
    return this.prisma.operationalReason.create({
      data: {
        category: data.category.trim().toUpperCase(),
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
    });
  }

  async deleteOperationalReason(id: string) {
    return this.prisma.operationalReason.delete({ where: { id } });
  }
}
