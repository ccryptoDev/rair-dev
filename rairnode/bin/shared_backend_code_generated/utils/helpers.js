////////////////////////////////////////////////////////////
// WARNING: AUTO GENERATED FILE
//
// DO NOT EDIT THIS FILE DIRECTLY
//
// Original source file exists in /shared_backend_code_source
// at the root of this repository
//
// Codegen command: bash commands/generate_shared_code.sh
//
////////////////////////////////////////////////////////////

const executePromisesSequentially = ({items, action}) => {
  return items.reduce((p, item) => {
     return p.then(() => action(item));
  }, Promise.resolve()); // initial
};

module.exports = {
  executePromisesSequentially
}
