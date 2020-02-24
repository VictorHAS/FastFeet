const Mail = use('Mail')

class CancelDeliveryEmail {
  static get key() {
    return 'CancelDeliveryEmail-key'
  }

  async handle(job) {
    const { data } = job

    await Mail.send(['emails.cancelation_order'], data, message => {
      message
        .to(data.to)
        .from('noreply@fastfeet.com.br', 'FastFeet')
        .subject(`Entrega #${data.id} cancelada!`)
    })

    await Mail.send('emails.new_delivery', data, message => {
      message
        .to(data.to)
        .from('noreply@fastfeet.com.br', 'FastFeet')
        .subject('Novo produto disponível para retirada')
    })

    return data
  }
}

module.exports = CancelDeliveryEmail
