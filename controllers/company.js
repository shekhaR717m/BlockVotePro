const CompanyModel = require('../models/company');
const bcrypt = require('bcryptjs');
const path = require('path');

module.exports = {
	// --- NEW ASYNC/AWAIT SYNTAX ---
	create: async function (req, res, cb) {
		try {
			// 1. Check if company already exists
			const existingCompany = await CompanyModel.findOne({ email: req.body.email });

			if (existingCompany) {
				res.json({ status: 'error', message: 'Company already exists ', data: null });
				return;
			}

			// 2. Create new company
			// Password hashing is handled by the model's 'pre' hook
			const newCompany = await CompanyModel.create({
				email: req.body.email,
				password: req.body.password,
			});

			// 3. Respond with success
			res.json({
				status: 'success',
				message: 'Company added successfully!!!',
				data: { id: newCompany._id },
			});
		} catch (err) {
			// Pass any database errors to the error handler
			cb(err);
		}
	},

	// --- NEW ASYNC/AWAIT SYNTAX ---
	authenticate: async function (req, res, cb) {
		try {
			// 1. Find the company by email
			const CompanyInfo = await CompanyModel.findOne({ email: req.body.email });

			// 2. Check if company exists AND password is correct
			if (CompanyInfo && bcrypt.compareSync(req.body.password, CompanyInfo.password)) {
				// Success
				res.json({
					status: 'success',
					message: 'company found!!!',
					data: { id: CompanyInfo._id, email: CompanyInfo.email },
				});
			} else {
				// Failure
				res.json({ status: 'error', message: 'Invalid email/password!!!', data: null });
			}
		} catch (err) {
			// Pass any database errors to the error handler
			cb(err);
		}
	},
};