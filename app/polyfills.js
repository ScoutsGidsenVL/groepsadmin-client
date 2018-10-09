Date.prototype.toJSON = function () {
  return moment(this.getTime()).format('YYYY-MM-DD');
};
