import { connect } from "@dagger.io/dagger"

connect(async (client) => {

  // use a node:16-slim container
  // mount the source code directory on the host
  // at /src in the container

  /**
   * withDirectory hace un mount al directorio /src del contenedor desde 
   * la referencia . del directorio host
   * se puede agregar una opcion adicional para excluir directorios 
   * en este caso se evita agregar node_modules y ci
   */
  const source = client.container()
    .from("node:16-slim")
    .withDirectory('/src', client.host().directory('.'), { exclude: ["node_modules/", "ci/"] })

  // set the working directory in the container
  // install application dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const out = await runner
    .withExec(["npm", "test", "--", "--watchAll=false"])
    .stderr()
  console.log(out)

}, { LogOutput: process.stdout })