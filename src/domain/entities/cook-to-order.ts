import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';

interface Item {
    name: string;
    quantity: number;
}

type CookToOrderProps = {
    orderId: string;
    items: Item[];
    status: CookToOrderStatus;
    createdAt: Date;
    updatedAt: Date;
};

export class CookToOrder {
    public orderId: string;
    public items: Item[];
    public status: CookToOrderStatus;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(props: CookToOrderProps) {
        this.orderId = props.orderId;
        this.items = props.items;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
