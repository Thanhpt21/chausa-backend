import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrepaymentService } from './prepayment.service';  // Đảm bảo bạn đã tạo service cho Prepayment
import { CreatePrepaymentDto } from './dto/create-prepayment.dto';  // Đảm bảo bạn đã tạo DTO cho CreatePrepayment
import { UpdatePrepaymentDto } from './dto/update-prepayment.dto';  // Đảm bảo bạn đã tạo DTO cho UpdatePrepayment
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';  // Guard bảo vệ các route
import { RolesGuard } from 'src/common/guards/roles/roles.guard';  // Guard kiểm tra quyền
import { Roles } from 'src/common/decorators/roles.decorator';  // Decorator cho các quyền người dùng
import { UserRole } from 'src/users/enums/user.enums';  // Enum các quyền người dùng (admin, user...)
import { PrepaymentStatus } from '@prisma/client';

@Controller('prepayments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class PrepaymentController {
  constructor(private readonly prepaymentService: PrepaymentService) {}

  // Tạo Prepayment
  @Post()
  create(@Body() createPrepaymentDto: CreatePrepaymentDto) {
    return this.prepaymentService.create(createPrepaymentDto);
  }

  // Lấy danh sách Prepayment, hỗ trợ phân trang
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.prepaymentService.findAll(+page, +limit);
  }

  @Get('total-sum')
  async getTotalPrepaymentSum(
    @Query('startDate') startDateParam?: string,
    @Query('endDate') endDateParam?: string,
  ) {
    const currentDate = new Date();

    // Nếu không truyền thì lấy từ đầu tháng tới cuối tháng hiện tại
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.prepaymentService.getTotalPrepaymentSum(startDate, endDate);
  }

  // Lấy 1 Prepayment theo ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prepaymentService.findOne(+id);
  }



  // Cập nhật Prepayment
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrepaymentDto: UpdatePrepaymentDto,
  ) {
    return this.prepaymentService.update(+id, updatePrepaymentDto);
  }

  // Xóa Prepayment
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prepaymentService.remove(+id);
  }

  // Lấy danh sách Prepayment theo customerId
  @Get('customer/:customerId')
  async findByCustomerId(@Param('customerId') customerId: string) {
    return this.prepaymentService.findByCustomerId(+customerId);
  }

  // Lấy tổng số tiền prepayment cho một khách hàng
  @Get('customer/:customerId/total')
  async getTotalAmount(@Param('customerId') customerId: string) {
    const totalAmount = await this.prepaymentService.getTotalAmountForCustomer(+customerId);
    return {
      success: true,
      message: 'Tổng số tiền thanh toán trước',
      data: totalAmount,
    };
  }

  @Put(':id/status')
  async updatePrepaymentStatus(
    @Param('id') id: string,
    @Body('status') newStatus: PrepaymentStatus, // Trực tiếp lấy 'status' từ body
  ) {
    return this.prepaymentService.updateStatus(+id, newStatus);
  }


}
