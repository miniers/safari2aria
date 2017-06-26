/**
 * Created by liukai on 2017/6/26.
 */
export default function (fn, args) {
  var script = document.createElement( 'script' );
  script.type = 'text/javascript';
  script.innerHTML = ['(',fn.toString(),')(',JSON.stringify(args),')'].join('');
  document.documentElement.appendChild(script)
}
