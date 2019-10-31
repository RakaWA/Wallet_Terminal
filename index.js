var Promise = require('bluebird'),
	inquirer = new Promise.promisifyAll(require('inquirer')),
	logSymbols = new Promise.promisifyAll(require('log-symbols')),
	ora = new Promise.promisifyAll(require('ora')),
	chalk = new Promise.promisifyAll(require('chalk')),
	clear = new Promise.promisifyAll(require('clear')),
	boxen = new Promise.promisifyAll(require('boxen')),
	exit = require('exit'),
	prompt = inquirer.createPromptModule(),
	currencyFormatter = new Promise.promisifyAll(require('currency-formatter')),
	Web3 = new Promise.promisifyAll(require('web3')),
	web3 = new Web3('https://testnet.tomochain.com'),
	Tokenabi = require('./erc20.json'),
	privkey = 'Copy Paste Private Keymu',
	pubkey = 'Copy Paste Public Keymu',
	contractAddr = 'Copy Paste Contract Address',
	token = new web3.eth.Contract(Tokenabi,
		contractAddr, {
			gasPrice: 250000000,
			gas: 2000000
		}),
	log = console.log,
	spinner;

function clibox() {
	log(boxen('Selamat Datang di Wallet', {
		padding: 2,
		margin: 1,
		borderStyle: 'double'
	}));
}

function balikcli() {
	prompt([{
		type: 'list',
		name: 'balik',
		message: 'Ingin kembali ke menu ?',
		choices: [chalk.green('Ya'), chalk.red('Tidak')]
	}]).then(ans => {
		if (ans.balik == chalk.green('Ya')) {
			log('\n');
			runperintah();
		} else {
			clear();
			exit();
		}
	});
}

function runperintah() {
	prompt([{
		type: 'list',
		name: 'daftar',
		message: 'Pilih perintah dibawah ini :',
		choices: [chalk.green('Balance Tomo'), chalk.green('Balance Token'), chalk.green('Kirim Tomo'), chalk.green('Kirim Token'), chalk.green('Tambah Token'), chalk.green('Burn Token'), chalk.red('Exit')]
	}]).then(ans => {
		if (ans.daftar == chalk.green('Balance Tomo')) {
			spinner = ora('Loading....').start();
			web3.eth.getBalance(pubkey).then(balanceTomo => {
				spinner.succeed('Balance Tomo saat ini adalah ' + (balanceTomo / 1000000000000000000).toFixed(4) + ' Tomo\n');
				balikcli();
			});
		} else if (ans.daftar == chalk.green('Balance Token')) {
			spinner = ora('Loading....').start();
			token.methods.balanceOf(pubkey).call().then(balanceToken => {
				spinner.succeed('Balance Token saat ini adalah ' + (balanceToken / 10000) + ' Token\n');
				balikcli();
			});
		} else if (ans.daftar == chalk.green('Kirim Tomo')) {
			prompt([{
				type: 'input',
				name: 'address',
				message: chalk.yellow('Masukkan address yang akan dikirim : ')
			}]).then(ans1 => {
				if (ans1.address.substr(0, 2) == "0x") {
					prompt([{
						type: 'input',
						name: 'values',
						message: chalk.yellow('Masukkan jumlah Tomo yang akan dikirim : ')
					}]).then(ans2 => {
						if (ans2.values != "") {
							prompt([{
								type: 'confirm',
								name: 'pilihan',
								message: chalk.yellow('Apakah anda yakin ingin mengirim Tomo dengan informasi seperti dibawah ini :\n\nTo Address : ') + chalk.blue(ans1.address) + chalk.yellow('\nJumlah : ') + chalk.blue(ans2.values + ' Tomo\n\nJawaban : ')
							}]).then(response => {
								if (response.pilihan == true) {
									const account = web3.eth.accounts.privateKeyToAccount(privkey);
									let coinbase = account.address;
									web3.eth.accounts.wallet.add(account);
									web3.eth.defaultAccount = coinbase;
									spinner = ora('Loading....').start();
									var fixValues = (ans2.values * (10 ** 18)),
										fixAddrTo = ans1.address;
									web3.eth.sendTransaction({
										from: coinbase,
										to: fixAddrTo,
										value: fixValues,
										gas: 2000000,
										gasPrice: 250000000,
										chainId: 89
									}).then(hash => {
										var transHash = hash.transactionHash;
										spinner.succeed(chalk.yellow('Send Tomo berhasil dilakukan dengan informasi sebagai berikut :\n\nURL : ') + chalk.blue('https://rinkeby.etherscan.io/txs/' + transHash) + chalk.yellow('\nTxId : ') + chalk.blue(transHash) + chalk.yellow('\nFrom Address : ') + chalk.blue(coinbase) + chalk.yellow('\nTo Address : ') + chalk.blue(ans1.address) + chalk.yellow('\nValues : ') + chalk.blue(ans2.values) + chalk.blue(' Tomo\n\n'));
										balikcli();
									}).catch(e => {
										spinner.fail(chalk.red('Permintaan gagal diproses\n'));
										balikcli();
									});
								} else {
									log(chalk.red('Permintaan gagal diproses\n'));
									balikcli();
								}
							});
						} else {
							log(chalk.red('Error\n'));
							balikcli();
						}
					});
				} else {
					log(chalk.red('Error\n'));
					balikcli();
				}
			});
		} else if (ans.daftar == chalk.green('Kirim Token')) {
			prompt([{
				type: 'input',
				name: 'address',
				message: chalk.yellow('Masukkan address yang akan dikirim : ')
			}]).then(ans1 => {
				if (ans1.address.substr(0, 2) == "0x") {
					prompt([{
						type: 'input',
						name: 'values',
						message: chalk.yellow('Masukkan jumlah Token yang akan dikirim : ')
					}]).then(ans2 => {
						if (ans2.values != "") {
							prompt([{
								type: 'confirm',
								name: 'pilihan',
								message: chalk.yellow('Apakah anda yakin ingin mengirim Token dengan informasi seperti dibawah ini :\n\nTo Address : ') + chalk.blue(ans1.address) + chalk.yellow('\nJumlah : ') + chalk.blue(ans2.values + ' Token\n\nJawaban : ')
							}]).then(response => {
								if (response.pilihan == true) {
									const account = web3.eth.accounts.privateKeyToAccount(privkey);
									let coinbase = account.address;
									web3.eth.accounts.wallet.add(account);
									web3.eth.defaultAccount = coinbase;
									spinner = ora('Loading....').start();
									var fixValues = (ans2.values * (10 ** 4)),
										fixAddrTo = ans1.address;
									token.methods.transfer(fixAddrTo, fixValues).send({
										from: coinbase,
										gas: 2000000,
										gasPrice: 250000000,
										chainId: 89
									}).then(hash => {
										var transHash = hash.transactionHash;
										spinner.succeed(chalk.yellow('Send Token berhasil dilakukan dengan informasi sebagai berikut :\n\nURL : ') + chalk.blue('https://rinkeby.etherscan.io/txs/' + transHash) + chalk.yellow('\nTxId : ') + chalk.blue(transHash) + chalk.yellow('\nFrom Address : ') + chalk.blue(coinbase) + chalk.yellow('\nTo Address : ') + chalk.blue(ans1.address) + chalk.yellow('\nValues : ') + chalk.blue(ans2.values) + chalk.blue(' Token\n\n'));
										balikcli();
									}).catch(e => {
										spinner.fail(chalk.red('Permintaan gagal diproses\n'));
										balikcli();
									});
								} else {
									log(chalk.red('Permintaan gagal diproses\n'));
									balikcli();
								}
							});
						} else {
							log(chalk.red('Error\n'));
							balikcli();
						}
					});
				} else {
					log(chalk.red('Error\n'));
					balikcli();
				}
			});
		} else if (ans.daftar == chalk.green('Tambah Token')) {
			prompt([{
				type: 'input',
				name: 'values',
				message: chalk.yellow('Masukkan jumlah Token Token yang akan ditambah : ')
			}]).then(ans1 => {
				if (ans1.values != "") {
					prompt([{
						type: 'confirm',
						name: 'pilihan',
						message: chalk.yellow('Apakah anda yakin ingin menambahkan Token Token dengan informasi sebagai berikut\n\nValues : ') + chalk.blue(ans1.values + ' Token') + chalk.yellow('\n\nJawaban : ')
					}]).then(ans2 => {
						if (ans2.pilihan == true) {
							const account = web3.eth.accounts.privateKeyToAccount(privkey);
							let coinbase = account.address;
							web3.eth.accounts.wallet.add(account);
							web3.eth.defaultAccount = coinbase;
							var fixValues = ans1.values * (10 ** 4);
							spinner = ora('Loading....').start();
							token.methods.mint(fixValues).send({
								from: coinbase,
								gas: 2000000,
								gasPrice: 250000000,
								chainId: 89
							}).then(hash => {
								var transHash = hash.transactionHash;
								spinner.succeed(chalk.yellow('Token berhasil ditambah dengan informasi sebagai berikut :\n\nURL : ') + chalk.blue('https://rinkeby.etherscan.io/txs/' + transHash) + chalk.yellow('\nTxId : ') + chalk.blue(transHash) + chalk.yellow('\nValues : +') + chalk.blue(ans1.values + ' Token\n'));
								balikcli();
							}).catch(e => {
								spinner.fail(chalk.red('Permintaan gagal diproses\n'));
								balikcli();
							});
						} else {
							log(chalk.red('Permintaan gagal diproses\n'));
							balikcli();
						}
					});
				} else {
					log(chalk.red('Permintaan gagal diproses\n'));
					balikcli();
				}
			});
		} else if (ans.daftar == chalk.green('Burn Token')) {
			prompt([{
				type: 'input',
				name: 'values',
				message: chalk.yellow('Masukkan jumlah Token Token yang akan dikurangi : ')
			}]).then(ans1 => {
				if (ans1.values != "") {
					prompt([{
						type: 'confirm',
						name: 'pilihan',
						message: chalk.yellow('Apakah anda yakin ingin mengurangi Token Token dengan informasi sebagai berikut\n\nValues : ') + chalk.blue(ans1.values + ' Token') + chalk.yellow('\n\nJawaban : ')
					}]).then(ans2 => {
						if (ans2.pilihan == true) {
							const account = web3.eth.accounts.privateKeyToAccount(privkey);
							let coinbase = account.address;
							web3.eth.accounts.wallet.add(account);
							web3.eth.defaultAccount = coinbase;
							var fixValues = ans1.values * (10 ** 4);
							spinner = ora('Loading....').start();
							token.methods.burn(fixValues).send({
								from: coinbase,
								gas: 2000000,
								gasPrice: 250000000,
								chainId: 89
							}).then(hash => {
								var transHash = hash.transactionHash;
								spinner.succeed(chalk.yellow('Token berhasil dikurangi dengan informasi sebagai berikut :\n\nURL : ') + chalk.blue('https://rinkeby.etherscan.io/txs/' + transHash) + chalk.yellow('\nTxId : ') + chalk.blue(transHash) + chalk.yellow('\nValues : -') + chalk.blue(ans1.values + ' Token\n'));
								balikcli();
							}).catch(e => {
								spinner.fail(chalk.red('Permintaan gagal diproses\n'));
								balikcli();
							});
						} else {
							log(chalk.red('Permintaan gagal diproses\n'));
							balikcli();
						}
					});
				} else {
					log(chalk.red('Permintaan gagal diproses\n'));
					balikcli();
				}
			});
		} else {
			clear();
			exit();
		}
	}).catch(e => {
		log(chalk.red('Error'));
		exit();
	});
}

clear();
clibox();
runperintah();

//Input dan Output
// prompt([{
// 	type: 'input',
// 	message: 'Siapa nama Anda : ',
// 	name: 'nama'
// }]).then(ans => {
// 	log(ans['nama']);
// });

//List
// prompt([{
// 	type: 'list',
// 	name: 'daftar',
// 	message: 'Pilih perintah dibawah ini :',
// 	choices: ['pertama', 'kedua']
// }]).then(ans => {
// 	log(ans.daftar);
// });
