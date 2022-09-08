let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let readLine = require("readline");

let reader = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("../proto/vacaciones.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
);

const remoteURL = "0.0.0.0:50050";

let client = new proto.lab4grcp.EmployeeLeaveDaysService(
  remoteURL,
  grpc.credentials.createInsecure()
);
// Se piden los datos del empleado.
reader.question("Ingrese el Id del empleado: ", (employee_id) => {
  reader.question("Ingrese el nombre del empleado: ", (name) => {
    reader.question(
      "Ingrese el numero de dias de vacaciones que va a pedir: ",
      (requested_leave_days) => {
        reader.question(
          "Ingrese el numero de dias de vacaciones que tiene acumulados: ",
          (accrued_leave_days) => {
            // Se llama la funcion del servidor para validar si es apto para tomar vacaciones.
            // Y se le mandan los datos del empleado.
            client.eligibleForLeave(
              {
                employee_id: employee_id,
                name: name,
                requested_leave_days: requested_leave_days,
                accrued_leave_days: accrued_leave_days,
              },
              (err, response) => {
                // Si es un error se imprime el error.
                if (err) {
                  console.log(err.details);
                  // Si no es un error se valida si el empleado puede tomar vacaciones.
                } else if (response.eligible) {
                  // Si puede tomar vacaciones, se llama la funcion del servidor para calcular los dias de vacaciones.
                  client.grantLeave(
                    {
                      employee_id: employee_id,
                      name: name,
                      requested_leave_days: requested_leave_days,
                      accrued_leave_days: accrued_leave_days,
                    },
                    (err, response) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(
                          "Se le han concedido " +
                            response.granted_leave_days +
                            " dias de vacaciones y le quedan " +
                            response.accrued_leave_days +
                            " dias de vacaciones acumulados"
                        );
                      }
                    }
                  );
                  // Si no puede tomar vacaciones, se imprime el mensaje de que no puede tomar vacaciones.
                } else {
                  console.log("No tiene dias de vacaciones suficientes");
                }
              }
            );
            reader.close();
          }
        );
      }
    );
  });
});
