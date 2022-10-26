require("dotenv").config();

const Sequelize = require("sequelize");
const { CONNECTION_STRING } = process.env;

const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

let nextEmp = 5;

module.exports = {
  getUpcomingAppointments: (req, res) => {
    sequelize
      .query(`  
    SELECT
        a.appt_id,
        a.date,
        a.service_type,
        a.approved,
        a.completed,
        u.first_name,
        u.last_name
    FROM
        cc_appointments a
        JOIN cc_emp_appts ea ON a.appt_id = ea.appt_id
        JOIN cc_employees e ON e.emp_id = ea.emp_id
        JOIN cc_users u ON e.user_id = u.user_id
    WHERE
        a.approved = TRUE
        AND a.completed = false
    ORDER BY
        a.date DESC;`
      )
      .then((dbRes) => res.status(200).send(dbRes[0]))
      .catch((err) => console.log(err));
  },

  approveAppointment: (req, res) => {
    let { apptId } = req.body;

    sequelize
      .query(
        `UPDATE
            cc_appointments
        SET
            approved = TRUE
        WHERE
            appt_id = ${apptId};
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `
      )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
        nextEmp += 2;
      })
      .catch((err) => console.log(err));
  },

  getAllClients: (req, res) => {
    sequelize.query(`
        SELECT
        *
        FROM
        cc_users
        JOIN cc_clients ON cc_users.user_id = cc_clients.user_id;
    `)
    .then((dbRes) => {
        res.status(200).send(dbRes[0])
    })
    .catch((err) => console.log(err))
  },

  getPendingAppointments: (req, res) => {
    sequelize.query(`
        SELECT
        *
        FROM
        cc_appointments
        WHERE
        approved = false;
    `)
    .then((dbRes) => {
        res.status(200).send(dbRes[0])
    })
    .catch((err) => console.log(err))
  },

  getPastAppointments: (req, res) => {
    sequelize.query(`
    SELECT
        a.appt_id,
        a.date,
        a.service_type,
        a.notes,
        u.first_name,
        u.last_name
    FROM
        cc_appointments   a
        JOIN cc_emp_appts ea ON a.appt_id = ea.appt_id
        JOIN cc_employees e   ON e.emp_id = ea.emp_id
        JOIN cc_users     u    ON e.user_id = u.user_id
    WHERE
        a.approved = TRUE
        AND a.completed = TRUE
    ORDER BY
        a.date DESC;
    `)
    .then((dbRes) => {
        res.status(200).send(dbRes[0])
    })
    .catch((err) => console.log(err))
  },

  completeAppointment: (req, res) => {
    let {apptId} = req.body;

    sequelize.query(`
        UPDATE
            cc_appointments
        SET
            completed = TRUE
        WHERE
            appt_id = ${apptId};
    `)
    .then((dbRes) => {
        res.status(200).send(dbRes[0])
    })
    .catch((err) => console.log(err))
  }

}


