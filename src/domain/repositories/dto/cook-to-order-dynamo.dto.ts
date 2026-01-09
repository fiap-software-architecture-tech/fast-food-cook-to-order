export interface CookToOrderDynamoDTO {
    pk: string;
    orderId: string;
    status: string;
    items: Array<any>;
    createdAt: number;
    updatedAt: number;
}
