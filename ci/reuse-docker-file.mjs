import { connect } from "@dagger.io/dagger"

connect(async (client) => {

  // set build context
  // se obtiene la referencia del directorio host
  const contextDir = client.host().directory(".")

  // build using Dockerfile
  // publish the resulting container to a registry
  const imageRef = await contextDir
    // construye el dockerfile si esta formateado como debe ser por defecto
    // es decir Dockerfile, de lo contrario se debe agregar el nombre y directorio correctos
    // del archivo que queremos construir
    .dockerBuild()
    .publish('ttl.sh/hello-dagger-' + Math.floor(Math.random() * 10000000))
  console.log(`Published image to: ${imageRef}`)

}, { LogOutput: process.stdout })