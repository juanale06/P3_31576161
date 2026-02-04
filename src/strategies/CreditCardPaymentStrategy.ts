import { PaymentStrategy, PaymentResult, PaymentDetails } from './PaymentStrategy.js';

interface FakePaymentRequest {
    amount: string;
    'card-number': string;
    cvv: string;
    'expiration-month': string;
    'expiration-year': string;
    'full-name': string;
    currency: string;
    description: string;
    reference: string;
}

interface FakePaymentResponse {
    success?: boolean;
    message?: string;
    transaction_id?: string;
    data?: {
        transaction_id?: string;
        amount?: string;
        currency?: string;
        description?: string;
        reference?: string;
        date?: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

export class CreditCardPaymentStrategy extends PaymentStrategy {
    private readonly apiUrl = 'https://fakepayment.onrender.com/payments';
    private readonly apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZmFrZSBwYXltZW50IiwiZGF0ZSI6IjIwMjYtMDEtMjBUMjI6MDY6MDYuNTE0WiIsImlhdCI6MTc2ODk0Njc2Nn0.jcifI7l3c3RWcr5gkbtpnykypjskqf9nB-aHWfmn3_s';
    private readonly timeout = 300000; // 5 minutos

    async processPayment(
        amount: number,
        paymentDetails: PaymentDetails,
        reference: string
    ): Promise<PaymentResult> {
        try {
            const requestBody: FakePaymentRequest = {
                amount: amount.toFixed(2),
                'card-number': paymentDetails.cardNumber,
                cvv: paymentDetails.cvv,
                'expiration-month': paymentDetails.expirationMonth,
                'expiration-year': paymentDetails.expirationYear,
                'full-name': paymentDetails.cardholderName,
                currency: paymentDetails.currency,
                description: `Order payment`,
                reference: reference,
            };

            console.log('💳 Procesando pago con FakePayment API...');
            console.log('📤 Request:', JSON.stringify(requestBody, null, 2));

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log('📥 Response status:', response.status);
            const data: FakePaymentResponse = await response.json();
            console.log('📥 Response data:', JSON.stringify(data, null, 2));

            if (response.ok && data.success) {
                console.log('✅ Pago exitoso:', data.data?.transaction_id);
                return {
                    success: true,
                    transactionId: data.data?.transaction_id || data.transaction_id,
                };
            } else {
                // Handle error response
                const errorCode = data.error?.code || 'UNKNOWN';
                const errorMessage = data.error?.message || 'Payment processing failed';

                console.log('❌ Pago rechazado:', errorCode, errorMessage);

                return {
                    success: false,
                    errorCode,
                    errorMessage,
                };
            }
        } catch (error: any) {
            // Handle network errors or timeouts
            if (error.name === 'AbortError') {
                console.log('⏱️ Timeout de pago (>5 min)');
                return {
                    success: false,
                    errorCode: 'TIMEOUT',
                    errorMessage: 'Payment request timed out',
                };
            }

            console.log('🔥 Error de red:', error.message);

            return {
                success: false,
                errorCode: 'NETWORK_ERROR',
                errorMessage: error.message || 'Network error occurred',
            };
        }
    }
}
