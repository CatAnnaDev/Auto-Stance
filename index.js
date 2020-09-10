
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
	isMystic = false,
	isNinja = false,
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
		'focus': () => {
			settings.Focus = !settings.Focus;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled Focus</font>' : '<font color="#FF0000">Disabled Focus</font>');
		},
		'auras': () => {
			settings.Auras = !settings.Auras;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled Auras</font>' : '<font color="#FF0000">Disabled Auras</font>');
		},
		'warr': () => {
			settings.Stance = !settings.Stance;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled Stance</font>' : '<font color="#FF0000">Disabled Stance</font>');
		},
		'onrez': () => {
			settings.onrez = !settings.onrez;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled on Resurrect</font>' : '<font color="#FF0000">Disabled on Resurrect</font>');
		},
		'dps': () => {
			settings.DPSStance = true;
			command.message('<font color="#00FF00">DPS STANCE ON</font>');
		},
		'tank': () => {
			settings.DPSStance = false;
			command.message('<font color="#00FF00">TANK STANCE ON</font>');
		},
		'ui': () => {
			ui.show();
		},
		'$default': () => {
			settings.enabled = !settings.enabled;
			command.message(settings.enabled ? '<font color="#00FF00">Enabled</font>' : '<font color="#FF0000">Disabled</font>');
		}
	});

	function Warr() {
		return settings.enabled && settings.Stance && isWarrior;
	}
	function Myst() {
		return settings.enabled && settings.Auras && isMystic;
	}
	function Ninja() {
		return settings.enabled && settings.Focus && isNinja;
	}

	mod.game.on('enter_game', () => {
		let model = mod.game.me.templateId;
		let job = (model - 10101) % 100;
		isWarrior = (job == 0);
		if(Warr()) {
			command.message('<font color="#FFFF00">Activating Stance</font>')
		};
		isMystic = (job == 7);
		if(Myst()) {
			command.message('<font color="#FFFF00">Activating Auras</font>')
		};
		isNinja = (job == 11);
		if(Ninja()) {
			command.message('<font color="#FFFF00">Activating Focus</font>')
		};
	});

	async function Warr() {
		if (settings.DPSStance ==! true && settings.Stance && isWarrior){
		// DPS STANCE
		if(hasNoAbn([100103,100150])) {
			command.message('<font color="#00FF80">Activating DPS STANCE</font>');
			startSkill(80400);
			await wait(250);
		}
		} else if (settings.DPSStance ==! false && settings.Stance && isWarrior) {
		// TANK STANCE
		if(hasNoAbn([100201, 100297, 100298, 100299, 100296])) {
			command.message('<font color="#00FF80">Activating TANK STANCE</font>');
			startSkill(90200);
			await wait(250);
		}
	}
}

	async function Ninja() {
		if (settings.Focus && isNinja){
		if(hasNoAbn([10154030, 10154032])) { // 10154032
			command.message('<font color="#00FF80">Activating Focus</font>');
			startSkill(110100);
			await wait(1000);
		}
	}
}

	async function Myst() {
		if (settings.Auras && isMystic){
		// Thrall Augmentation
		if(hasNoAbn([702000,702005])) {
			command.message('<font color="#00FF80">Activating Thrall Augmentation</font>');
			startSkill(450100);
			await wait(250);
		}
		// Aura of the Merciless (Crit Aura)
		if(hasNoAbn([700600,700601,700602,700603])) {
			command.message('<font color="#FF00FF">Activating Crit Aura</font>');
			startSkill(130400);
			await wait(1050);
		}
		// Aura of the Tenacious (Mana Aura)
		if(hasNoAbn([700330,700300])) {
			command.message('<font color="#00FFFF">Activating Mana Aura</font>');
			startSkill(160100);
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
				if(Warr()) {
					mod.setTimeout(Warr, 2000);
				}
			}
	});
	mod.hook('S_SPAWN_ME', 3, (event) => {
		if (mod.game.me.gameId == event.gameId) {
			loc = event.loc;
			wloc = event.w;
			if(Ninja()) {
				mod.setTimeout(Ninja, 2000);
			}
		}
});
	mod.hook('S_SPAWN_ME', 3, (event) => {
		if (mod.game.me.gameId == event.gameId) {
			loc = event.loc;
			wloc = event.w;
			if(Myst()) {
				mod.setTimeout(Myst, 2000);
			}
		}
	});

	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		loc = event.loc;
		wloc = event.w;
	});

	mod.hook('S_CREATURE_LIFE', 3, (event)=>{
		if(Warr() && settings.onrez)
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
					mod.setTimeout(Warr, 3000);
				}
			}
		}
	});

	mod.hook('S_CREATURE_LIFE', 3, (event)=>{
		if(Myst() && settings.onrez)
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
					mod.setTimeout(Myst, 3000);
				}
			}
		}
	});
	mod.hook('S_CREATURE_LIFE', 3, (event)=>{
		if(Ninja() && settings.onrez)
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
					mod.setTimeout(Ninja, 3000);
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
