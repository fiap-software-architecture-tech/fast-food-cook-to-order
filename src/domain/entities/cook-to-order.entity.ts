import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';

interface Item {
    name: string;
    quantity: number;
}

type CookToOrderProps = {
    orderId: string;
    items: Item[];
    status: CookToOrderStatus;
    createdAt: string;
    updatedAt: string;
};

export class CookToOrder {
    public orderId: string;
    public items: Item[];
    public status: CookToOrderStatus;
    public createdAt: string;
    public updatedAt: string;

    constructor(props: CookToOrderProps) {
        this.orderId = props.orderId;
        this.items = props.items;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    ready(): void {
        this.status = CookToOrderStatus.DONE;
        this.updatedAt = new Date().toISOString();
    }

    start(): void {
        this.status = CookToOrderStatus.IN_PROGRESS;
        this.updatedAt = new Date().toISOString();
    }
}
