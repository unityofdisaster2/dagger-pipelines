import { connect } from "@dagger.io/dagger"


connect(async (client) => {

  // use a node:16-slim container
  // mount the source code directory on the host
  // at /src in the container
  const source = client.container()
    .from("node:16-slim")
    .withDirectory('/src', client.host().directory('.', { exclude: ["node_modules/", "ci/"] }))

  // set the working directory in the container
  // install application dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const test = runner
    .withExec(["npm", "test", "--", "--watchAll=false"])

  // build application
  // write the build output to the host
  await test
    .withExec(["npm", "run", "build"])
    .directory("./build")
    .export("./build")

  // highlight-start
  // use an nginx:alpine container
  // copy the build/ directory into the container filesystem
  // at the nginx server root
  // publish the resulting container to a registry

  // podemos no solo ejecutar una serie de pasos en nuestro pipeline
  // sino tambien operaciones mas complejas como publicar nuestro proyecto en un contenedor
  // el proceso es bastante similar a como se define la parte inicial del pipeline
  // pero se agrega la instruccion publish con el nombre de la imagen
  const imageRef = await client.container()
    .from("nginx:1.23-alpine")
    .withDirectory('/usr/share/nginx/html', client.host().directory('./build'))
    .publish('ttl.sh/hello-dagger-' + Math.floor(Math.random() * 10000000))

  // !!!!!!!!!! este es un ejemplo muy basico, en realidad si se desea publicar a un registro
  // en particular, es necesario agregar nuestras credenciales de docker o del registro
  // para eso se debe invocar la instruccion Container.withRegistryAuth()
  console.log(`Published image to: ${imageRef}`)
  // highlight-end

}, { LogOutput: process.stdout })