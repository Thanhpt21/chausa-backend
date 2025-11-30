import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { InventoryModule } from './inventory/inventory.module';
import { CustomerModule } from './customer/customer.module';
import { ImportModule } from './import/import.module';
import { ImportDetailModule } from './import-detail/import-detail.module';
import { SupplierModule } from './supplier/supplier.module';
import { PrepaymentModule } from './prepayment/prepayment.module';
import { ExportModule } from './export/export.module';
import { ExportDetailModule } from './export-detail/export-detail.module';
import { ColorModule } from './color/color.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { TransferService } from './transfer/transfer.service';
import { TransferController } from './transfer/transfer.controller';
import { TransferModule } from './transfer/transfer.module';
import { TransferDetailModule } from './transfer-detail/transfer-detail.module';
import { PurchaseRequestModule } from './purchase-request/purchase-request.module';
import { PurchaseRequestDetailModule } from './purchase-request-detail/purchase-request-detail.module';
import { ProjectCategoryModule } from './project-category/project-category.module';
import { WarrantyModule } from './warranty/warranty.module';
import { ComboModule } from './combo/combo.module';
import { ProductComboModule } from './product-combo/product-combo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
      isGlobal: true,
    }),
    PrismaModule, 
    UsersModule, 
    AuthModule,
    PrismaModule, 
    UploadModule, 
    CategoryModule, 
    ProductModule,
    InventoryModule,
    CustomerModule,
    ImportModule,
    ImportDetailModule,
    SupplierModule,
    PrepaymentModule,
    ExportModule,
    ExportDetailModule,
    ColorModule,
    WarehouseModule,
    TransferModule,
    TransferDetailModule,
    PurchaseRequestModule,
    PurchaseRequestDetailModule,
    ProjectCategoryModule,
    WarrantyModule,
    ComboModule,
    ProductComboModule,
  ],
  controllers: [AppController, TransferController],
  providers: [AppService, PrismaService, JwtStrategy, TransferService],
})
export class AppModule {}

