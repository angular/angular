/**
 * Helper class to interact with project-wide properties.
 */
class Property {
  /**
   * Create a new `Property` instance for the specified key.
   *
   * @param {string} key - The key of the property.
   */
  constructor(key) {
    this._key = `property:${key}`;
  }

  /**
   * Delete this property.
   */
  delete() {
    Property._PROPS.deleteProperty(this._key);
  }

  /**
   * Get the current value of this property.
   *
   * @return {unknown} - The current value of this property or `null` if this property does not
   *     exist.
   */
  get() {
    const storedValue = Property._PROPS.getProperty(this._key);
    return storedValue && JSON.parse(storedValue);
  }

  /**
   * Set the value of this property.
   * Any existing value will be replaced.
   *
   * @param {unknown} newValue - The new value to set.
   */
  set(newValue) {
    if (newValue == null) {
      this.delete();
    } else {
      Property._PROPS.setProperty(this._key, JSON.stringify(newValue));
    }
  }
}

Property.editedSheets = new Property('editedSheets');

Property._PROPS = PropertiesService.getScriptProperties();
