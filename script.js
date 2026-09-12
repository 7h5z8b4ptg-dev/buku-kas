(function(){
"use strict";

var state={users:[],currentUser:null,route:"dashboard",filter:"semua",transactions:[]};
var CATEGORIES=["Makanan & Minuman","Transportasi","Pendidikan","Hiburan","Kebutuhan Harian","Lainnya"];
var MONTHS=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
var content=document.getElementById("content");

function uid(){return "t"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function formatRupiah(n){return "Rp"+Math.abs(Math.round(n)).toLocaleString("id-ID")}
function formatDateID(iso){var p=iso.split("-");return parseInt(p[2],10)+" "+MONTHS[parseInt(p[1],10)-1]+" "+p[0]}
function todayISO(){return new Date().toISOString().slice(0,10)}
function seedTransactions(){
 var today=new Date(), d=function(o){var x=new Date(today);x.setDate(x.getDate()-o);return x.toISOString().slice(0,10)};
 state.transactions=[
 {id:uid(),type:"in",amount:1500000,date:d(9),category:"Pemasukan",note:"Uang saku bulanan dari orang tua"},
 {id:uid(),type:"out",amount:25000,date:d(8),category:"Makanan & Minuman",note:"Makan siang di kantin"},
 {id:uid(),type:"out",amount:15000,date:d(7),category:"Transportasi",note:"Ongkos angkot ke kampus"},
 {id:uid(),type:"in",amount:350000,date:d(6),category:"Pemasukan",note:"Honor jadi asisten dosen"},
 {id:uid(),type:"out",amount:120000,date:d(5),category:"Pendidikan",note:"Fotokopi & alat tulis"},
 {id:uid(),type:"out",amount:45000,date:d(3),category:"Hiburan",note:"Nonton bareng teman kos"},
 {id:uid(),type:"out",amount:60000,date:d(1),category:"Kebutuhan Harian",note:"Sabun, sampo, dan tisu"}];
}
function totals(){var income=0,expense=0;state.transactions.forEach(function(t){t.type==="in"?income+=t.amount:expense+=t.amount});return{income:income,expense:expense,balance:income-expense}}
function categoryBreakdown(){var m={};state.transactions.forEach(function(t){if(t.type==="out")m[t.category]=(m[t.category]||0)+t.amount});return Object.keys(m).map(function(k){return{name:k,amount:m[k]}}).sort(function(a,b){return b.amount-a.amount})}
function sortedTransactions(){return state.transactions.slice().sort(function(a,b){return a.date<b.date?1:-1})}

document.querySelectorAll(".tab-btn").forEach(function(btn){btn.addEventListener("click",function(){
 document.querySelectorAll(".tab-btn").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");
 var tab=btn.dataset.tab;document.getElementById("form-masuk").style.display=tab==="masuk"?"block":"none";document.getElementById("form-daftar").style.display=tab==="daftar"?"block":"none";
})});

document.getElementById("btn-register").addEventListener("click",function(){
 var name=document.getElementById("reg-name").value.trim(),email=document.getElementById("reg-email").value.trim().toLowerCase(),pass=document.getElementById("reg-password").value,pass2=document.getElementById("reg-password2").value,msg=document.getElementById("msg-daftar");
 msg.textContent="";
 if(!name||!email||!pass||!pass2){msg.textContent="Semua kolom wajib diisi.";return}
 if(pass.length<6){msg.textContent="Kata sandi minimal 6 karakter.";return}
 if(pass!==pass2){msg.textContent="Konfirmasi kata sandi tidak cocok.";return}
 if(state.users.some(function(u){return u.email===email})){msg.textContent="Email ini sudah terdaftar. Silakan masuk.";return}
 state.users.push({name:name,email:email,password:pass});msg.style.color="var(--income)";msg.textContent="Akun berhasil dibuat! Silakan masuk.";
 setTimeout(function(){document.querySelector('.tab-btn[data-tab="masuk"]').click();document.getElementById("login-email").value=email;msg.style.color=""},700);
});
document.getElementById("btn-login").addEventListener("click",function(){
 var email=document.getElementById("login-email").value.trim().toLowerCase(),pass=document.getElementById("login-password").value,msg=document.getElementById("msg-masuk");
 msg.textContent="";var user=state.users.find(function(u){return u.email===email&&u.password===pass});
 if(!user){msg.textContent="Email atau kata sandi salah.";return}enterApp(user.name);
});
document.getElementById("btn-guest").addEventListener("click",function(){enterApp("Tamu")});
document.getElementById("btn-logout").addEventListener("click",function(){
 document.getElementById("app-shell").classList.remove("visible");document.getElementById("login-screen").style.display="flex";
 document.getElementById("login-email").value="";document.getElementById("login-password").value="";
});
document.querySelectorAll(".nav-item").forEach(function(btn){btn.addEventListener("click",function(){navigate(btn.dataset.route)})});
function enterApp(name){state.currentUser=name;if(!state.transactions.length)seedTransactions();document.getElementById("login-screen").style.display="none";document.getElementById("app-shell").classList.add("visible");document.getElementById("user-name-label").textContent=name;navigate("dashboard")}
function navigate(route){state.route=route;document.querySelectorAll(".nav-item").forEach(function(b){b.classList.toggle("active",b.dataset.route===route)});render()}
function render(){if(state.route==="dashboard")renderDashboard();else if(state.route==="income")renderIncome();else if(state.route==="expense")renderExpense();else renderHistory()}

function renderDashboard(){
 var t=totals(),cats=categoryBreakdown(),max=cats.length?cats[0].amount:0,recent=sortedTransactions().slice(0,5);
 var catHtml=cats.length?cats.map(function(c){var pct=max?Math.round(c.amount/max*100):0;return '<div class="cat-row"><div class="cat-name">'+c.name+'</div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:'+pct+'%"></div></div><div class="cat-amount">'+formatRupiah(c.amount)+'</div></div>'}).join(""):'<div class="empty-hint">Belum ada pengeluaran tercatat.</div>';
 var recentHtml=recent.map(function(tr){return '<div class="recent-item"><div>'+tr.note+'<span class="recent-date">'+formatDateID(tr.date)+" · "+tr.category+'</span></div><div class="'+(tr.type==="in"?"amt-in":"amt-out")+'">'+(tr.type==="in"?"+":"-")+formatRupiah(tr.amount)+"</div></div>"}).join("");
 content.innerHTML='<div class="page"><div class="page-head"><h2>Ringkasan keuangan</h2><p>Pantau arus kas kamu sekilas pandang</p></div><div class="stat-row"><div class="stat-block"><div class="stat-label">Total pemasukan</div><div class="stat-value income">'+formatRupiah(t.income)+'</div><div class="stat-sub">Sepanjang periode tercatat</div></div><div class="stat-block"><div class="stat-label">Total pengeluaran</div><div class="stat-value expense">'+formatRupiah(t.expense)+'</div><div class="stat-sub">Sepanjang periode tercatat</div></div><div class="stat-block"><div class="stat-label">Saldo tersisa</div><div class="stat-value">'+formatRupiah(t.balance)+'</div><div class="stat-sub">'+state.transactions.length+" transaksi tercatat</div></div></div><div class=\"two-col\"><div class=\"panel\"><div class=\"panel-title\">Pengeluaran per kategori</div>"+catHtml+'</div><div class="panel"><div class="panel-title">Transaksi terbaru</div>'+recentHtml+'<button class="see-all" id="see-all">Lihat semua riwayat</button></div></div></div>';
 document.getElementById("see-all").onclick=function(){navigate("history")};
}
function renderIncome(){
 var list=sortedTransactions().filter(function(t){return t.type==="in"}).slice(0,5);
 content.innerHTML='<div class="page"><div class="page-head"><h2>Tambah pemasukan</h2><p>Catat setiap uang yang kamu terima</p></div><div class="two-col"><div class="panel"><div class="form-msg" id="income-msg"></div><div class="form-grid"><div class="field"><label>Jumlah (Rp)</label><input type="number" id="income-amount" min="0" placeholder="Contoh: 500000"></div><div class="field"><label>Tanggal</label><input type="date" id="income-date" value="'+todayISO()+'"></div><div class="field full"><label>Keterangan</label><input type="text" id="income-note" placeholder="Contoh: Uang saku dari orang tua"></div></div><button class="btn btn-income" id="btn-add-income">Simpan pemasukan</button></div><div class="panel"><div class="panel-title">Pemasukan terbaru</div>'+list.map(function(t){return '<div class="recent-item"><div>'+t.note+'<span class="recent-date">'+formatDateID(t.date)+'</span></div><div class="amt-in">+'+formatRupiah(t.amount)+'</div></div>'}).join("")+'</div></div></div>';
 document.getElementById("btn-add-income").onclick=function(){var a=+document.getElementById("income-amount").value,d=document.getElementById("income-date").value,n=document.getElementById("income-note").value.trim(),m=document.getElementById("income-msg");if(!a||a<=0){m.textContent="Masukkan jumlah yang valid.";return}if(!d||!n){m.textContent="Tanggal dan keterangan wajib diisi.";return}state.transactions.push({id:uid(),type:"in",amount:a,date:d,category:"Pemasukan",note:n});renderIncome()};
}
function renderExpense(){
 var list=sortedTransactions().filter(function(t){return t.type==="out"}).slice(0,5),options=CATEGORIES.map(function(c){return '<option>'+c+'</option>'}).join("");
 content.innerHTML='<div class="page"><div class="page-head"><h2>Tambah pengeluaran</h2><p>Catat setiap uang yang kamu keluarkan</p></div><div class="two-col"><div class="panel"><div class="form-msg" id="expense-msg"></div><div class="form-grid"><div class="field"><label>Jumlah (Rp)</label><input type="number" id="expense-amount" min="0" placeholder="Contoh: 25000"></div><div class="field"><label>Kategori</label><select id="expense-category">'+options+'</select></div><div class="field"><label>Tanggal</label><input type="date" id="expense-date" value="'+todayISO()+'"></div><div class="field"><label>Keterangan</label><input type="text" id="expense-note" placeholder="Contoh: Makan siang"></div></div><button class="btn btn-expense" id="btn-add-expense">Simpan pengeluaran</button></div><div class="panel"><div class="panel-title">Pengeluaran terbaru</div>'+list.map(function(t){return '<div class="recent-item"><div>'+t.note+'<span class="recent-date">'+formatDateID(t.date)+" · "+t.category+'</span></div><div class="amt-out">-'+formatRupiah(t.amount)+'</div></div>'}).join("")+'</div></div></div>';
 document.getElementById("btn-add-expense").onclick=function(){var a=+document.getElementById("expense-amount").value,c=document.getElementById("expense-category").value,d=document.getElementById("expense-date").value,n=document.getElementById("expense-note").value.trim(),m=document.getElementById("expense-msg");if(!a||a<=0){m.textContent="Masukkan jumlah yang valid.";return}if(!d||!n){m.textContent="Tanggal dan keterangan wajib diisi.";return}state.transactions.push({id:uid(),type:"out",amount:a,date:d,category:c,note:n});renderExpense()};
}
function renderHistory(){
 var list=sortedTransactions().filter(function(t){return state.filter==="semua"||(state.filter==="pemasukan"?t.type==="in":t.type==="out")});
 var rows=list.map(function(t){return '<tr><td>'+formatDateID(t.date)+'</td><td>'+t.note+'</td><td>'+t.category+'</td><td><span class="tag '+(t.type==="in"?"tag-in":"tag-out")+'">'+(t.type==="in"?"Pemasukan":"Pengeluaran")+'</span></td><td class="num '+(t.type==="in"?"amt-in":"amt-out")+'">'+(t.type==="in"?"+":"-")+formatRupiah(t.amount)+'</td><td class="num"><button class="row-del" data-id="'+t.id+'">✕</button></td></tr>'}).join("");
 content.innerHTML='<div class="page"><div class="page-head"><h2>Riwayat transaksi</h2><p>Semua pemasukan dan pengeluaran kamu, dari yang terbaru</p></div><div class="panel"><div class="filter-tabs"><button class="filter-tab '+(state.filter==="semua"?"active":"")+'" data-f="semua">Semua</button><button class="filter-tab '+(state.filter==="pemasukan"?"active":"")+'" data-f="pemasukan">Pemasukan</button><button class="filter-tab '+(state.filter==="pengeluaran"?"active":"")+'" data-f="pengeluaran">Pengeluaran</button></div><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
 document.querySelectorAll(".filter-tab").forEach(function(b){b.onclick=function(){state.filter=b.dataset.f;renderHistory()}});
 document.querySelectorAll(".row-del").forEach(function(b){b.onclick=function(){state.transactions=state.transactions.filter(function(t){return t.id!==b.dataset.id});renderHistory()}});
}
})();