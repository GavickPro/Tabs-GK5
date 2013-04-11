jQuery.noConflict();

jQuery(window).load(function(){
	jQuery(document).find('.gkTabsGK5').each(function(i, el) {
		el = jQuery(el);
		var module_id = el.attr('id');
		var config = jQuery.parseJSON(el.attr('data-config').replace(new RegExp('\'', 'g'), '"')); 
		var tabs = el.find('.gkTabsItem');
		var items = el.find('.gkTabsNav li');
		var tabs_wrapper = jQuery(el.find('.gkTabsContainer')[0]);
		var animation = (config['animation'] == 0) ? true : false;
		var current_tab = config['active_tab'] - 1;
		var previous_tab = null;
		var eventActivator = config['activator'];
		var amount = tabs.length;
		var timer = false;
		var blank = false;
		var falsy_click = false;
		var animation_type = config['animation_type'];
		//
		tabs_wrapper.css('height', jQuery(tabs[config['active_tab']-1]).outerHeight() + "px");
		jQuery(tabs).css('opacity', 0);
		jQuery(tabs[config['active_tab']-1]).css({
			'opacity': '1',
			'position': 'relative',
			'z-index': 2
		});
		// set the fixed height
		if(config['auto_height'] == '0') {
			tabs_wrapper.css('height', config['module_height'] + 'px');
		}
		// add events to tabs
		items.each(function(i, item){
			item = jQuery(item);
			item.bind(eventActivator, function(){
				if(i != current_tab) {
					previous_tab = current_tab;
					current_tab = i;
					
					if(config['auto_height'] == '1') {
						tabs_wrapper.css('height', tabs_wrapper.outerHeight() + 'px');
					}
					
					var previous_animation = jQuery(items[previous_tab]).attr('data-animation');
					if(previous_animation == 'default') previous_animation = config['animation_type'];
					var previous_tab_animation = { 'opacity': 0 };
					var current_animation = jQuery(items[current_tab]).attr('data-animation');
					if(current_animation == 'default') current_animation = config['animation_type'];
					var current_tab_animation = { 'opacity': 1 };
					//
					if(previous_animation == 'slide_horizontal') {
						previous_tab_animation['left'] = -1 * jQuery(tabs[previous_tab]).outerWidth();
					} else if(previous_animation == 'slide_vertical') {
						previous_tab_animation['top'] = -1 * jQuery(tabs[previous_tab]).outerHeight();
					} 
					//
					if(current_animation == 'slide_horizontal') {
						current_tab_animation['left'] = 0;
					} else if(current_animation == 'slide_vertical') {
						current_tab_animation['top'] = 0;
					}
					//
					jQuery(tabs[previous_tab]).animate(previous_tab_animation, config['animation_speed']);
					jQuery(tabs[previous_tab]).css('z-index', '1');
					//
					jQuery(tabs[previous_tab]).removeClass('active');
					jQuery(tabs[current_tab]).addClass('active');
					//
					if(config['auto_height'] == '1') {
						tabs_wrapper.animate({ 
							"height": jQuery(tabs[i]).outerHeight()
						}, 
						config['animation_speed'], 
						function() { 
							tabs_wrapper.css('height', 'auto');
							jQuery(tabs[previous_tab]).css({
								'position': 'absolute',
								'top': '0'
							});	 
						});
					} else {
						setTimeout(function(){
							jQuery(tabs[previous_tab]).css({
								'position': 'absolute',
								'top': '0'
							});	 
						}, config['animation_speed']);	
					}
					//
					setTimeout(function(){
						//
						if(current_animation == 'slide_horizontal') {
							jQuery(tabs[current_tab]).css('left', jQuery(tabs[current_tab]).outerWidth());
						} else if(current_animation == 'slide_vertical') {
							jQuery(tabs[current_tab]).css('top', jQuery(tabs[current_tab]).outerHeight());
						}
						// anim
						jQuery(tabs[current_tab]).animate(current_tab_animation, config['animation_speed']);
						
						jQuery(tabs[current_tab]).css({
							'position': 'relative',
							'z-index': '2'
						});
					}, config['animation_speed']);
					
					// external trigger
					if(typeof gkTabEventTrigger !== 'undefined') {
						gkTabEventTrigger(i, current_tab, module_id);
					}
					// common operations for both types of animation
					if(!falsy_click) blank = true;
					else falsy_click = false;
					jQuery(items[previous_tab]).removeClass('active');
					jQuery(items[current_tab]).addClass('active');
					// save the cookie
					if(config['cookie_save'] == 1) {					
						var date = new Date();
						date.setTime(date.getTime()+(256*24*60*60*1000));
						document.cookie = ('gktab-' + module_id) + "=" + (i + 1) + ("; expires="+date.toGMTString()) + "; path=/";
					}
				}
			});
		});
		// add events to buttons
		if(el.find('.gkTabsButtonNext').length > 0) {
			jQuery(el.find('.gkTabsButtonNext')[0]).click(function() {
				if(current_tab < amount - 1) jQuery(items[current_tab + 1]).trigger(eventActivator);	
				else jQuery(items[0]).trigger(eventActivator);
			});
			
			jQuery(el.find('.gkTabsButtonPrev')[0]).click(function() {
				if(current_tab > 0) jQuery(items[current_tab - 1]).trigger(eventActivator);	
				else jQuery(items[amount - 1]).trigger(eventActivator);
			});
		}
		//
		if(config["animation"] == 1) {
			setInterval(function(){
				if(!blank) {
					falsy_click = true;
					if(current_tab < amount - 1) jQuery(items[current_tab + 1]).trigger(eventActivator);	
					else jQuery(items[0]).trigger(eventActivator);
				} else {
					blank = false;
				}
			}, config["animation_interval"]);
		}
	});
});