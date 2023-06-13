import { connect } from "@dagger.io/dagger"

// initialize Dagger client
// proporciona una interfaz para ejecutar comandos en el engine de dagger
connect(async (client) => {

  // use a node:16-slim container
  // get version
  // tal cual obtiene un contenedor que use como imagen node 16 y ejecutando comando para ver la version
  const node = client.container().from("node:16-slim").withExec(["node", "-v"])

  // execute
  const version = await node.stdout()

  // print output
  console.log("Hello from Dagger and Node " + version)
}, { LogOutput: process.stdout })