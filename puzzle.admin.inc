<?php
/**
 * Configuration Settings for Puzzle
 */
function _puzzle_settings_form($form, &$form_state){
  $puzzle_levels = variable_get('puzzle_levels_number', 
    PUZZLE_LEVELS_NUMBER_DEFAULT);
  /*$form['general'] = array(
    '#type' => 'fieldset',
    '#title' => t('General Settings'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE
  );*/
  /*$form['general']['timeout'] = array(
    '#type' => 'textfield',
    '#title' => t('Timeout Counter'),
    '#default_value' => variable_get('puzzle_timeout_counter', 
      PUZZLE_TIMEOUT_COUNTER_DEFAULT),
  );*/
  
  $form['puzzle_levels'] = array(
    '#type' => 'fieldset',
    '#title' => t('Puzzle Levels'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE
  );
  for($i=0; $i<$puzzle_levels; $i++){
    $form['puzzle_levels']['level_'.$i] = array(
      '#type' => 'fieldset',
      '#title' => 'Level '.$i,
      '#collapsible' => FALSE,
      '#collapsed' => FALSE
    );
    $form['puzzle_levels']['level_'.$i]['x_divisions_'.$i] = array(
      '#type' => 'textfield',
      '#title' => t('Horizontal Divisions'),
      '#default_value' => variable_get('puzzle_x_divisions_'.$i, 
        constant('PUZZLE_LEVEL_'.$i.'_X_DIV_DEFAULT')),
    );
    $form['puzzle_levels']['level_'.$i]['y_divisions_'.$i] = array(
      '#type' => 'textfield',
      '#title' => t('Vertical Divisions'),
      '#default_value' => variable_get('puzzle_y_divisions_'.$i,
        constant('PUZZLE_LEVEL_'.$i.'_Y_DIV_DEFAULT')),
    );
    $form['puzzle_levels']['level_'.$i]['pprs_'.$i] = array(
      '#type' => 'textfield',
      '#title' => t('Points Per Remaining Seconds'),
      '#default_value' => variable_get('puzzle_pprs_'.$i,
        constant('PUZZLE_LEVEL_'.$i.'_PPRS_DEFAULT')),
    );
    $form['puzzle_levels']['level_'.$i]['timeout_'.$i] = array(
      '#type' => 'textfield',
      '#title' => t('Timeout Counter'),
      '#default_value' => variable_get('puzzle_timeout_counter_'.$i, 
        PUZZLE_TIMEOUT_COUNTER_DEFAULT),
    );
    $form['puzzle_levels']['level_'.$i]['win_text_'.$i] = array(
      '#type' => 'textfield',
      '#title' => t('Win Text'),
      '#default_value' => variable_get('puzzle_win_text_'.$i, 
        constant('PUZZLE_LEVEL_'.$i.'_WIN_TEXT_DEFAULT')),
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save')
  );
  
  return $form;
}
 
 /**
  * Validation Handler for the Configuration Settings Puzzle
  */
function _puzzle_settings_form_validate($form, &$form_state){

}

 /**
  * Submission Handler for the Configuration Settings Puzzle
  */
function _puzzle_settings_form_submit($form, &$form_state){
  $puzzle_levels = variable_get('puzzle_levels_number', 
    PUZZLE_LEVELS_NUMBER_DEFAULT);
  
  //variable_set('puzzle_timeout_counter', $form_state['values']['timeout']);
  
  for($i=0; $i<$puzzle_levels; $i++){
    variable_set('puzzle_x_divisions_'.$i, $form_state['values']['x_divisions_'.$i]);
    variable_set('puzzle_y_divisions_'.$i, $form_state['values']['y_divisions_'.$i]);
    variable_set('puzzle_pprs_'.$i, $form_state['values']['pprs_'.$i]);
    variable_set('puzzle_timeout_counter_'.$i, $form_state['values']['timeout_'.$i]);
    variable_set('puzzle_win_text_'.$i, $form_state['values']['win_text_'.$i]);
  }
  
  drupal_set_message('Your settings were saved succesfully');
}