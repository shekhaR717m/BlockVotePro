const VoterModel = require('../models/voter');
const bcrypt = require('bcryptjs');
const path = require('path');
var nodemailer = require('nodemailer');
// const saltRounds = 10; // No longer needed here, model handles it

// Create a reusable transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

module.exports = {
	create: function (req, res, cb) {
		VoterModel.findOne(
			{ email: req.body.email, election_address: req.body.election_address },
			function (err, result) {
				if (err) {
					cb(err);
				} else {
					if (!result) {
						// --- FIX: Pass the plain password. The model will hash it. ---
						// (Your original code saved req.body.email as the password, which was a bug)
						VoterModel.create(
							{
								email: req.body.email,
								password: req.body.password, // <-- Pass plain password
								election_address: req.body.election_address,
							},
							function (err, voter) {
								if (err) cb(err);
								else {
									console.log(voter);
									// Send registration confirmation email
									const mailOptions = {
										from: process.env.EMAIL,
										to: voter.email,
										subject: req.body.election_name,
										html:
											`You have been successfully registered for the election: ${req.body.election_name}.` +
											'<br>Your voting ID is your email: ' +
											voter.email +
											'<br>Please use the password you just set.' +
											'<br><a href="http://localhost:3000/homepage">Click here to visit the website</a>',
									};

									transporter.sendMail(mailOptions, function (err, info) {
										if (err) {
											res.json({ status: 'error', message: 'Voter could not be added', data: null });
											console.log(err);
										} else {
											console.log(info);
											res.json({ status: 'success', message: 'Voter added successfully!!!', data: null });
										}
									});
								}
							}
						);
					} else {
						res.json({ status: 'error', message: 'Voter already exists ', data: null });
					}
				}
			}
		);
	},

	authenticate: function (req, res, cb) {
		VoterModel.findOne({ email: req.body.email }, function (err, voterInfo) {
			if (err) cb(err);
			else {
				// This logic remains correct.
				if (voterInfo && bcrypt.compareSync(req.body.password, voterInfo.password))
					res.json({
						status: 'success',
						message: 'voter found!!!',
						data: { id: voterInfo._id, election_address: voterInfo.election_address },
					});
				else {
					res.json({ status: 'error', message: 'Invalid email/password!!!', data: null });
				}
			}
		});
	},

	getAll: function (req, res, cb) {
		let voterList = [];
		VoterModel.find({ election_address: req.body.election_address }, function (err, voters) {
			if (err) cb(err);
			else {
				for (let voter of voters) voterList.push({ id: voter._id, email: voter.email });
				let count = voterList.length;
				res.json({
					status: 'success',
					message: 'voters list found!!!',
					data: { voters: voterList },
					count: count,
				});
			}
		});
	},

	updateById: function (req, res, cb) {
		VoterModel.findOne({ email: req.body.email, election_address: req.body.election_address }, function (err, result) {
			if (err) {
				cb(err);
			} else {
				if (!result) {
					// --- FIX: Only update email. Password updates should be a separate function. ---
					VoterModel.findByIdAndUpdate(
						req.params.voterId,
						{ email: req.body.email },
						{ new: true },
						function (err, voterInfo) {
							if (err) cb(err);
							else {
								const mailOptions = {
									from: process.env.EMAIL,
									to: voterInfo.email,
									subject: `Voter Registration Updated for ${req.body.election_name}`,
									html:
										`Your voter registration for ${req.body.election_name} has been updated.` +
										'<br>Your new voting id (email) is: ' +
										voterInfo.email +
										'<br><a href="http://localhost:3000/homepage">Click here to visit the website</a>',
								};
								transporter.sendMail(mailOptions, function (err, info) {
									if (err) {
										res.json({ status: 'error', message: 'Voter could not be updated', data: null });
									} else {
										res.json({ status: 'success', message: 'Voter updated successfully!!!', data: null });
									}
								});
							}
						}
					);
				} else {
					res.json({ status: 'error', message: 'Voter with this email already exists ', data: null });
				}
			}
		});
	},

	deleteById: function (req, res, cb) {
		// --- FIX: 'findByIdAndRemove' is deprecated. Use 'findByIdAndDelete'. ---
		VoterModel.findByIdAndDelete(req.params.voterId, function (err, voterInfo) {
			if (err) cb(err);
			else {
				res.json({ status: 'success', message: 'voter deleted successfully!!!', data: null });
			}
		});
	},

	// This function remains correct from my previous update.
	resultMail: async function (req, res, cb) {
		try {
			const voters = await VoterModel.find({ election_address: req.body.election_address });
			const { election_name, winner_candidate, candidate_email } = req.body;

			// 1. Create all email promises for voters
			const voterMailPromises = voters.map((voter) => {
				const mailOptions = {
					from: process.env.EMAIL,
					to: voter.email,
					subject: `${election_name} results`,
					html: `The results of ${election_name} are out.<br>The winner candidate is: <b>${winner_candidate}</b>.`,
				};
				return transporter.sendMail(mailOptions);
			});

			// 2. Send all voter emails in parallel
			await Promise.all(voterMailPromises);
			console.log('All voter result emails sent.');

			// 3. Send the winner email
			const winnerMailOptions = {
				from: process.env.EMAIL,
				to: candidate_email,
				subject: `${election_name} results !!!`,
				html: `Congratulations! You won the ${election_name} election.`,
			};
			await transporter.sendMail(winnerMailOptions);
			console.log('Winner email sent.');

			// 4. Send ONE response to the client
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