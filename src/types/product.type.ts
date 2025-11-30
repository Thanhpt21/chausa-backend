export interface ProductSizeDetail {
    productId: number; // ID của sản phẩm mà kích thước này thuộc về
    sizeId: number;    // ID của kích thước (ví dụ: ID của 'S', 'M', 'L')
    title: string;     // Tên của kích thước (ví dụ: 'S', 'M', 'L')
    quantity: number;  // Số lượng sản phẩm có kích thước này
}