
const Settings_UI = require('tera-mod-ui').Settings;

module.exports = function AutoStance(mod) {
	
	const AbnormalManager = require('./abnormal.js');
	const AbnManager = new AbnormalManager(mod,false);
	const wait = ms => new Promise(resolve => mod.setTimeout(resolve, ms));
	const command = mod.command;
	const settings = mod.settings	
	const enabled = mod.settings.enabled;
	let loc, wloc,
	isWarrior = false,
	isDead = false;

	command.add(['stance', 'stances', 'autostance', 'autostances'], {
		'on': () => {
			settings.enabled = true;
			command.message('<font color="#00FF00">Enabled</font>');
		},
		'off': () => {
			settings.enabled = false;
			command.message('<font color="#FF0000">Disabled</font>');
		},
		'onrez': () => {
			settings.onrez = !settings.onrez;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled on Resurrect</font>' : '<font color="#FF0000">Disabled on Resurrect</font>');
		},
		'tank': () => {
			settings.DPSStance = !settings.DPSStance;
			command.message(settings.DPSStance ? '<font color="#00FF00">DPS STANCE ON</font>' : '<font color="#FF0000">TANK STANCE ON</font>');
		},
		'ui': () => {
			ui.show();
		},
		'$default': () => {
			settings.enabled = !settings.enabled;
			command.message(settings.enabled ? '<font color="#00FF00">Enabled</font>' : '<font color="#FF0000">Disabled</font>');
		}
	});

	function isEnabled() {
		return settings.enabled && isWarrior;
	}

	mod.game.on('enter_game', () => {
		let model = mod.game.me.templateId;
		let job = (model - 10101) % 100;
		isWarrior = (job == 0);
		if(isEnabled()) {
			command.message('<font color="#FFFF00">Activating Stance</font>')
		}
	});

	async function auras() {
		if (settings.DPSStance == true){
		// DPS STANCE
		if(hasNoAbn([100103,100150])) {
			command.message('<font color="#00FF80">Activating DPS STANCE</font>');
			startSkill(80400);
			await wait(250);
		}
	} else {
				// TANK STANCE
				if(hasNoAbn([100201, 100297, 100298, 100299, 100296])) {
					command.message('<font color="#00FF80">Activating TANK STANCE</font>');
					startSkill(90200);
					await wait(250);
				}
			}
	}

	function startSkill(skillId) { 
		mod.toServer('C_START_SKILL', 7, {
				skill: { reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: skillId },
				w: wloc,
				loc: loc,
				dest: {x: 0, y: 0, z: 0},
				unk: true,
				moving: false,
				continue: false,
				target: 0n,
				unk2: false
		});
	}

	function hasNoAbn(ids) {
		return ids.reduce((accumulator, currentId) => accumulator && !hasAbn(currentId),true);
	}

	function hasAbn(id) {
		return ('added' in AbnManager.get(mod.game.me.gameId, id));
	}

	mod.hook('S_SPAWN_ME', 3, (event) => {
			if (mod.game.me.gameId == event.gameId) {
				loc = event.loc;
				wloc = event.w;
				if(isEnabled()) {
					mod.setTimeout(auras, 2000);
				}
			}
	});

	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		loc = event.loc;
		wloc = event.w;
	});

	// Auras after resurrect
	mod.hook('S_CREATURE_LIFE', 3, (event)=>{
		if(isEnabled() && settings.onrez)
		{
			if (event.gameId !== mod.game.me.gameId) return;

			loc = event.loc

			if(!event.alive)
			{
				isDead = true;
			}
			else
			{
				if(isDead) {
					isDead = false;
					mod.setTimeout(auras, 3000);
				}
			}
		}
    });

	// User Interface
    let ui = null;
	if (global.TeraProxy.GUIMode) {
		ui = new Settings_UI(mod, require('./settings_structure'), mod.settings, { 
			alwaysOnTop: true,
			width: 500,
			height: 200 
		});
		ui.on('update', settings => {
			mod.settings = settings;
		});
		this.destructor = () => {
			if (ui) {
				ui.close();
				ui = null;
			}
		};
	}
};
