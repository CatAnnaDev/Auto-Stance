
const Settings_UI = require('tera-mod-ui').Settings;

module.exports = function AutoStance(mod) {
	
	const AbnormalManager = require('./abnormal.js');
	const AbnManager = new AbnormalManager(mod,false);
	const wait = ms => new Promise(resolve => mod.setTimeout(resolve, ms));
	const command = mod.command;
	const settings = mod.settings	
	const enabled = mod.settings.enabled;
	let loc, wloc,
	isDead = false;

mod.game.on('enter_game', () => {
	let Class = mod.game.me.class;
	Type(Class);
});

function Type(Class){
	switch (Class){
		case 'warrior': Warr(); if (settings.msg){command.message('<font color="#FFFF00">Activating Stance</font>')}; break;
		case 'assassin': Ninja(); if (settings.msg){command.message('<font color="#FFFF00">Activating Focus</font>')}; break;
		case 'elementalist': Myst(); if (settings.msg){command.message('<font color="#FFFF00">Activating Auras</font>')}; break;
	}
}

	async function Warr() {
		if (settings.DPSStance == true && settings.Stance){
		// DPS STANCE
		if(hasNoAbn([100103,100150])) {
			await wait(12500);
			if (settings.msg){command.message('<font color="#00FF80">Activating DPS STANCE</font>')};
			startSkill(80400);
		}
		} else if (settings.DPSStance == false && settings.Stance) {
		// TANK STANCE
		if(hasNoAbn([100201, 100297, 100298, 100296, 100299])) {
			await wait(12500);
			if (settings.msg){command.message('<font color="#00FF80">Activating TANK STANCE</font>')};			
			startSkill(90200);
		}
	}
}

	async function Ninja() {
		if (settings.Focus){
		if(hasNoAbn([10154030, 10154032])) { // 10154032
			await wait(12500);
			if (settings.msg){command.message('<font color="#00FF80">Activating Focus</font>')};
			startSkill(110100);
		}
	}
}

	async function Myst() {
		if (settings.Auras){
		// Thrall Augmentation
		if(hasNoAbn([702000,702005])) {
			await wait(12500);
			if (settings.msg){command.message('<font color="#00FF80">Activating Thrall Augmentation</font>')};
			startSkill(450100);
			await wait(250);
		}
		// Aura of the Merciless (Crit Aura)
		if(hasNoAbn([700603, 700631, 603])) {
			if (settings.msg){command.message('<font color="#FF00FF">Activating Crit Aura</font>')};
			startSkill(130400);
			await wait(1050);
		}
		// Aura of the Tenacious (Mana Aura)
		if(hasNoAbn([700300])) {
			if (settings.msg){command.message('<font color="#00FFFF">Activating Mana Aura</font>')};
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

	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		loc = event.loc;
		wloc = event.w;
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
		'msg': () => {
			settings.msg = !settings.msg;
			command.message(settings.onrez ? '<font color="#00FF00">Enabled in game feed back</font>' : '<font color="#FF0000">Disabled in game feed back</font>');
		},
		'ui': () => {
			ui.show();
		},
		'$default': () => {
			settings.enabled = !settings.enabled;
			command.message(settings.enabled ? '<font color="#00FF00">Enabled</font>' : '<font color="#FF0000">Disabled</font>');
		}
	});
	// User Interface
    let ui = null;
	if (global.TeraProxy.GUIMode) {
		ui = new Settings_UI(mod, require('./settings_structure'), mod.settings, { 
			alwaysOnTop: true,
			width: 500,
			height: 270 
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
