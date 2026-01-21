export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
}

export interface PaymentDetails {
    cardNumber: string;
    cvv: string;
    expirationMonth: string;
    expirationYear: string;
    cardholderName: string;
    currency: string;
}

export abstract class PaymentStrategy {
    abstract processPayment(
        amount: number,
        paymentDetails: PaymentDetails,
        reference: string
    ): Promise<PaymentResult>;
}
