const VoterModel = require('../models/voter');
const bcrypt = require('bcryptjs');
const path = require('path');
var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

module.exports = {
	// --- NEW ASYNC/AWAIT SYNTAX ---
	create: async function (req, res, cb) {
		try {
			// 1. Check if voter already exists for this election
			const existingVoter = await VoterModel.findOne({
				email: req.body.email,
				election_address: req.body.election_address,
			});

			if (existingVoter) {
				res.json({ status: 'error', message: 'Voter already exists ', data: null });
				return;
			}

			// 2. Create the new voter
			const newVoter = await VoterModel.create({
				email: req.body.email,
				password: req.body.password, // Password hashing handled by model
				election_address: req.body.election_address,
			});

			console.log(newVoter);

			// 3. Send confirmation email
			const mailOptions = {
				from: process.env.EMAIL,
				to: newVoter.email,
				subject: req.body.election_name,
				html:
					`You have been successfully registered for the election: ${req.body.election_name}.` +
					'<br>Your voting ID is your email: ' +
					newVoter.email +
					'<br>Please use the password you just set.' +
					'<br><a href="http://localhost:3000/">Click here to visit the website</a>',
			};

			// We use transporter's callback (this is fine, it's not Mongoose)
			transporter.sendMail(mailOptions, function (err, info) {
				if (err) {
					console.log(err);
					// Note: We've already created the user, but mail failed.
					// For this project, we'll still report success, but log the mail error.
					// In a real-world app, you might handle this differently.
					res.json({
						status: 'error',
						message: 'Voter added, but confirmation email failed to send.',
						data: null,
					});
				} else {
					console.log(info);
					res.json({
						status: 'success',
						message: 'Voter added successfully!!!',
						data: null,
					});
				}
			});
		} catch (err) {
			cb(err); // Pass database errors to the main error handler
		}
	},

	// --- NEW ASYNC/AWAIT SYNTAX ---
	authenticate: async function (req, res, cb) {
		try {
			const voterInfo = await VoterModel.findOne({ email: req.body.email });

			if (voterInfo && bcrypt.compareSync(req.body.password, voterInfo.password)) {
				res.json({
					status: 'success',
					message: 'voter found!!!',
					data: { id: voterInfo._id, election_address: voterInfo.election_address },
				});
			} else {
				res.json({ status: 'error', message: 'Invalid email/password!!!', data: null });
			}
		} catch (err) {
			cb(err);
		}
	},

	// --- NEW ASYNC/AWAIT SYNTAX ---
	getAll: async function (req, res, cb) {
		try {
			let voterList = [];
			const voters = await VoterModel.find({ election_address: req.body.election_address });

			for (let voter of voters) {
				voterList.push({ id: voter._id, email: voter.email });
			}
			let count = voterList.length;
			res.json({
				status: 'success',
				message: 'voters list found!!!',
				data: { voters: voterList },
				count: count,
			});
		} catch (err) {
			cb(err);
		}
	},

	// --- NEW ASYNC/AWAIT SYNTAX ---
	updateById: async function (req, res, cb) {
		try {
			// 1. Check if the *new* email already exists
			const existingVoter = await VoterModel.findOne({
				email: req.body.email,
				election_address: req.body.election_address,
			});

			if (existingVoter) {
				res.json({ status: 'error', message: 'Voter with this email already exists ', data: null });
				return;
			}

			// 2. Update the voter
			const updatedVoterInfo = await VoterModel.findByIdAndUpdate(
				req.params.voterId,
				{ email: req.body.email },
				{ new: true } // This returns the updated document
			);

			if (!updatedVoterInfo) {
				res.json({ status: 'error', message: 'Voter not found', data: null });
				return;
			}

			console.log('Inside find after update' + updatedVoterInfo);

			// 3. Send update email
			const mailOptions = {
				from: process.env.EMAIL,
				to: updatedVoterInfo.email,
				subject: `Voter Registration Updated for ${req.body.election_name}`,
				html:
					`Your voter registration for ${req.body.election_name} has been updated.` +
					'<br>Your new voting id (email) is: ' +
					updatedVoterInfo.email +
					'<br><a href="http://localhost:3000/">Click here to visit the website</a>',
			};

			transporter.sendMail(mailOptions, function (err, info) {
				if (err) {
					console.log(err);
					res.json({ status: 'error', message: 'Voter updated, but email send failed.', data: null });
				} else {
					console.log(info);
					res.json({
						status: 'success',
						message: 'Voter updated successfully!!!',
						data: null,
					});
				}
			});
		} catch (err) {
			cb(err);
		}
	},

	// --- NEW ASYNC/AWAIT SYNTAX ---
	deleteById: async function (req, res, cb) {
		try {
			await VoterModel.findByIdAndDelete(req.params.voterId);
			res.json({ status: 'success', message: 'voter deleted successfully!!!', data: null });
		} catch (err) {
			cb(err);
		}
	},

	// This function was already correct
	resultMail: async function (req, res, cb) {
		try {
			const voters = await VoterModel.find({ election_address: req.body.election_address });
			const { election_name, winner_candidate, candidate_email } = req.body;

			const voterMailPromises = voters.map((voter) => {
				const mailOptions = {
					from: process.env.EMAIL,
					to: voter.email,
					subject: `${election_name} results`,
					html: `The results of ${election_name} are out.<br>The winner candidate is: <b>${winner_candidate}</b>.`,
				};
				return transporter.sendMail(mailOptions);
			});

			await Promise.all(voterMailPromises);
			console.log('All voter result emails sent.');

			const winnerMailOptions = {
				from: process.env.EMAIL,
				to: candidate_email,
				subject: `${election_name} results !!!`,
				html: `Congratulations! You won the ${election_name} election.`,
			};
			await transporter.sendMail(winnerMailOptions);
			console.log('Winner email sent.');

			res.json({ status: 'success', message: 'All result mails sent successfully!!!', data: null });
		} catch (err) {
			console.log(err);
			if (!res.headersSent) {
				res.json({ status: 'error', message: 'Error sending result emails', data: null });
			}
			cb(err);
		}
	},
};