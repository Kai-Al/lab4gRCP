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

reader.question("Ingrese el Id del empleado: ", (employee_id) => {
  reader.question("Ingrese el nombre del empleado: ", (name) => {
    reader.question(
      "Ingrese el numero de dias de vacaciones que va a pedir: ",
      (requested_leave_days) => {
        reader.question(
          "Ingrese el numero de dias de vacaciones que tiene acumulados: ",
          (accrued_leave_days) => {
            client.eligibleForLeave(
              {
                employee_id: employee_id,
                name: name,
                requested_leave_days: requested_leave_days,
                accrued_leave_days: accrued_leave_days,
              },
              (err, response) => {
                if (err) {
                  console.log(err.details);
                } else if (response.eligible) {
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
