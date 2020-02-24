const Mail = use('Mail')

class NewDeliveryEmail {
  static get key() {
    return 'NewDeliveryEmail-key'
  }

  async handle(job) {
    const { data } = job

    await Mail.send('emails.new_delivery', data, message => {
      message
        .to(data.to)
        .from('noreply@fastfeet.com.br', 'FastFeet')
        .subject('Novo produto disponível para retirada')
    })

    return data
  }
}

module.exports = NewDeliveryEmail
