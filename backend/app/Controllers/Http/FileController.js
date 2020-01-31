'use strict'

const Helpers = use('Helpers')
const File = use('App/Models/File')

const Env = use('Env')

class FileController {
  async store({ request }) {
    const file = request.file('file', {
      types: ['image'],
      size: '2mb'
    })

    await file.move(Helpers.tmpPath('uploads'), {
      name: `${new Date().getTime()}.${file.subtype}`
    })

    if (!file.moved()) {
      return file.error()
    }

    const fileModel = await File.create({
      name: file.fileName,
      path: `${Env.get('APP_URL')}${file.fileName}`
    })

    return fileModel
  }

  async show({ params, response }) {
    return response.download(Helpers.tmpPath(`uploads/${params.file}`))
  }
}

module.exports = FileController
