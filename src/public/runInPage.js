/**
 * Created by liukai on 2017/6/26.
 */
function getId () {
  let random = (new Date()).getTime() * Math.random(),
    hash = 0;
  random = random.toString();
  for (var i = 0; i < random.length; i++) {
    hash = ~~(((hash << 5) - hash) + random.charCodeAt(i));
  }
  return Math.abs(hash);
}

export default function (fn, args) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = ['run_js',getId()].join('_');
  script.innerHTML = ['(', fn.toString(), ')(', JSON.stringify(args), ',"', script.id, '")'].join('');
  document.documentElement.appendChild(script)
}
