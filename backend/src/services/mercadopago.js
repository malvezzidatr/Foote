const { MercadoPagoConfig, Payment } = require('mercadopago');

function createPaymentClient(accessToken) {
  const client = new MercadoPagoConfig({ accessToken });
  return new Payment(client);
}

async function criarPagamentoPix({ accessToken, descricao, valor, email, externalRef, webhookUrl }) {
  const payment = createPaymentClient(accessToken);

  const resultado = await payment.create({
    body: {
      transaction_amount: valor,
      description: descricao,
      payment_method_id: 'pix',
      payer: { email: email || 'jogador@rachafc.com' },
      external_reference: externalRef || undefined,
      notification_url: webhookUrl || undefined,
    },
  });

  return {
    id: resultado.id,
    status: resultado.status,
    qr_code: resultado.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64: resultado.point_of_interaction?.transaction_data?.qr_code_base64,
  };
}

async function buscarPagamento(accessToken, paymentId) {
  const payment = createPaymentClient(accessToken);
  return await payment.get({ id: paymentId });
}

module.exports = { criarPagamentoPix, buscarPagamento };
