<?php

/**
* Tabs GK5 - main PHP file
* @package Joomla!
* @Copyright (C) 2009-2012 Gavick.com
* @ All rights reserved
* @ Joomla! is Free Software
* @ Released under GNU/GPL License : http://www.gnu.org/copyleft/gpl.html
* @ version $Revision: GK5 1.0 $
**/

defined('JPATH_BASE') or die;

jimport('joomla.form.formfield');

class JFormFieldTabmanager extends JFormField {
	protected $type = 'Tabmanager';

	protected function getInput() {
		$add_form = '<div id="gk_tab_manager"><div id="gk_tab_add_header"><a href="#add">'.JText::_('MOD_TABS_GK5_FORM_ITEM_ADD').'</a><span>'.JText::_('MOD_TABS_GK5_FORM_ITEM_ADD_TIP').'</span></div><div id="gk_tab_add_form">'.$this->getForm('add').'</div></div>';
		
		$edit_form = $this->getForm('edit');
		
		$item_form = '<div id="invisible">
			<div class="gk_tab_item">
				<div class="gk_tab_item_desc">
					
					<span class="gk_tab_item_name"></span>
					<a href="#remove" class="gk_tab_item_remove" title="'.JText::_('MOD_TABS_GK5_FORM_ITEM_REMOVE').'">'.JText::_('MOD_TABS_GK5_FORM_ITEM_REMOVE').'</a>
					<span class="gk_tab_item_type"></span>
					<span class="gk_tab_item_access"></span>
					<span class="gk_tab_item_state published">
						<span>'.JText::_('MOD_TABS_GK5_FORM_ITEM_PUBLISHED').'</span>
						<span>'.JText::_('MOD_TABS_GK5_FORM_ITEM_UNPUBLISHED').'</span>
					</span>
				</div>
				<div class="gk_tab_editor_scroll">
					<div class="gk_tab_item_editor">'.$edit_form.'</div>
				</div>
			</div>
		</div>';
		
		$tabs_list = '<div id="tabs_list"></div>';
		$textarea = '<textarea name="'.$this->name.'" id="'.$this->id.'" rows="20" cols="50">'.$this->value.'</textarea>';
		return $item_form . $add_form . $tabs_list . $textarea;
	}
	
	private function getForm($type = 'add') {
        // read the JSON with module positions
        $json_positions = json_decode(file_get_contents(JPATH_ROOT . DS . 'modules' . DS . 'mod_tabs_gk5' . DS . 'admin' . DS . 'elements' . DS . 'positions.json'));
        // generate the selectbox
        $module_position_select = '<select class="gk_tab_'.$type.'_content_module">';
        $flag_start = false;
        // generate options
        foreach($json_positions as $position) {
        	$module_position_select .= '<option value="'.$position.'"'.(!$flag_start ? ' selected="selected"' : '').'>'.$position.'</option>';
        	$flag_start = true;
        }
        // close the selectbox
        $module_position_select .= '</select>';
        // tab title 
       	$form_name_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_NAME_TOOLTIP') . '"' : '';
        $form_name = '<p><label'.$form_name_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_NAME').'</label><input type="text" class="gk_tab_'.$type.'_name" /></p>';
        // tab type
        $form_type_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_TYPE_TOOLTIP') . '"' : '';
		$form_type = '<p><label'.$form_type_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_TYPE').'</label><select class="gk_tab_'.$type.'_type"><option value="module">'.JText::_('MOD_TABS_GK5_TYPE_MODULE').'</option><option value="xhtml" selected="selected">'.JText::_('MOD_TABS_GK5_TYPE_XHTML').'</option></select></p>';
		// tab access
		$form_access_level_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_ACCESS_TOOLTIP') . '"' : '';
		$form_access_level = '<p><label'.$form_access_level_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_ACCESS').'</label>'.JHtml::_('access.level', '', null, ' class="gk_tab_'.$type.'_content_access" ', array(), '').'</p>';
		// tab content
		$form_content_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_CONTENT_TOOLTIP') . '"' : '';
		$form_content = '<p><label'.$form_content_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_CONTENT').'</label><textarea class="gk_tab_'.$type.'_content_xhtml"></textarea>' . $module_position_select . '<p>';
		// tab published
		$form_published_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_PUBLISHED_TOOLTIP') . '"' : '';
		$form_published = '<p><label'.$form_published_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_PUBLISHED').'</label><select class="gk_tab_'.$type.'_published"><option value="1">'.JText::_('MOD_TABS_GK5_PUBLISHED').'</option><option value="0">'.JText::_('MOD_TABS_GK5_UNPUBLISHED').'</option></select></p>';
		// tab id
		$form_id_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_ID_TOOLTIP') . '"' : '';
		$form_id = '<p><label'.$form_id_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_ID').'</label><input type="text" class="gk_tab_'.$type.'_id" /></p>';
		
		// read the JSON with module positions
		$json_animations = json_decode(file_get_contents(JPATH_ROOT . DS . 'modules' . DS . 'mod_tabs_gk5' . DS . 'admin' . DS . 'elements' . DS . 'animations.json'));
		// generate the selectbox
		$form_animation_tooltip = ($type == 'add') ? ' class="hasTip" title="' . JText::_('MOD_TABS_GK5_FORM_ANIMATION_TOOLTIP') . '"' : '';
		$form_animation_select = '<p><label'.$form_animation_tooltip.'>'.JText::_('MOD_TABS_GK5_FORM_ANIMATION').'</label><select class="gk_tab_'.$type.'_animation">';
		$form_animation_select .= '<option value="default">'.JText::_('MOD_TABS_GK5_FORM_ANIMATION_DEFAULT').'</option>';
		$flag_start = false;
		// generate options
		foreach($json_animations as $animation) {
			$form_animation_select .= '<option value="'.$animation.'"'.(!$flag_start ? ' selected="selected"' : '').'>'.$animation.'</option>';
			$flag_start = true;
		}
		// close the selectbox
		$form_animation_select .= '</select></p>';
		// form buttons
		$form_buttons = '<div class="gk_tab_'.$type.'_submit"><a href="#save" class="gk_tab_save">'.JText::_('MOD_TABS_GK5_FORM_SAVE').'</a><a href="#cancel">'.JText::_('MOD_TABS_GK5_FORM_CANCEL').'</a></div>';
		// final form
		$form = '<div class="height_scroll"><div class="gk_tab_'.$type.'">'.$form_name.$form_type.$form_access_level.$form_published.$form_content.$form_id.$form_animation_select.$form_buttons.'</div></div>';
		// output
		return $form;
	}
}

// EOF