export class CreateOrderDto {
  tableId: number;
  items: {
    productId: number;
    quantity: number;
    price: number; // O anki fiyatı da kaydedelim ki zam gelirse eski sipariş bozulmasın
  }[];
}