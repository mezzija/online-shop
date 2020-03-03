(async function () {
    const viewNumber=(num)=>{
        const regDelimiter=new RegExp(/\B(?=(\d{3})+(?!\d))/g );
        return num.toFixed(2).replace(regDelimiter,',');
    };
    class Products{
        constructor({
                        products,
                        sectionEl,
                        currentSortDirection,
                        basket,
                    })  {
            this.defaultData = [...products];
            this.currentData = [...products];
            this.sectionEl=sectionEl;
            this.currentSortDirection = currentSortDirection;
            this.basket=basket;
        }
        sort(event){
            event.preventDefault();
            if(this.currentSortDirection==='desc'){
                event.target.textContent='Asc';
                this.currentSortDirection='asc'
            }else{
                event.target.textContent='Desc';
                this.currentSortDirection='desc'
            }
            this.render();
        }
        search(event){
            event.preventDefault();
            const reg=new RegExp(`^${event.target.value}`,'i');
            this.currentData = this.defaultData.filter(product => reg.test(product.title));
            if(this.currentSortDirection==='asc'){
                this.currentSortDirection==='desc';
                this.render();
            }else{
                this.currentSortDirection==='asc';
                this.render();
            }
            if(this.currentData.length===0){
                this.sectionEl.innerHTML=`
                 <p class="NoResult">No results found for your request</p>
            `;
            }
        }
        render(isDefault){
            const data = isDefault ? this.defaultData : this.currentData;
            this.sectionEl.innerHTML='';
            const sortedData = data.sort((a, b) => {
                const sortCondition = this.currentSortDirection === 'desc'
                    ? a.price.value > b.price.value
                    : a.price.value < b.price.value;
                return sortCondition ? 1 : -1;
            });
            for (let i=0;i<sortedData.length;i++){

                let newDiv=document.createElement('div');
                newDiv.classList.add('content');
                newDiv.classList.add('row');
                let currency;
                if(sortedData[i].price.currency==='USD'){
                    currency='$';
                }else if(sortedData[i].price.currency==='BYN'){
                    currency='BYN';
                }
                newDiv.innerHTML=`
                <div class="img">
            <img src=${sortedData[i].imageLink}>
            </div>
            <div class="textWidth">
            <a class="title" href="#">${sortedData[i].title}</a>
            <p class="characteristic">${sortedData[i].description}</p>
            </div>
            <div class="contentPrice">
            <p >${currency} ${viewNumber(sortedData[i].price.value)}</p>
             <a class="button" href="#">Add to Basket</a>
         </div>
            
    `;
                let a=newDiv.querySelector('.button');
                let title = newDiv.querySelector('.title');
                title.addEventListener('click',this.renderTitle(sortedData[i].id));
                a.addEventListener('click',this.basket.addToBasket.call(this.basket,sortedData[i].id));
                if(this.basket.cBasket.includes(sortedData[i].id)){
                    a.classList.add('active');
                    a.textContent='Remove from Basket';
                }
                sectionEl.appendChild(newDiv);
            }
        }
        renderTitle(ID){
            return event=>{
                event.preventDefault();
                this.sectionEl.innerHTML='';
                let data=this.defaultData.find(item=>item.id===ID);
                let newDiv=document.createElement('div');
                newDiv.classList.add('content');
                newDiv.classList.add('row');
                window.history.pushState({ID},'title',data.title);

            };

        }
    }
    class Basket{
        constructor({currentBasket,products} ){
            this.cBasket=currentBasket ;
            this.products=[...products];
        }
        addToBasket(productID){
            return event=>{
                event.preventDefault();
                if(!this.cBasket.includes(productID)){
                    event.target.textContent='Remove from Basket';
                    event.target.classList.add('active');
                    this.cBasket.push(productID);
                    localStorage.setItem('currentBasket',JSON.stringify(this.cBasket));
                }else{
                    event.target.textContent='Add to Basket';
                    event.target.classList.remove('active');
                    this.cBasket=this.cBasket.filter(item=>item!==productID);
                    localStorage.setItem('currentBasket',JSON.stringify(this.cBasket));
                }
                this.renderBasket();
            };
        }
        renderBasket(){
            const amountEl=document.getElementById('amount');
            const counterEl=document.getElementById('counter');
            const signCurrency=document.getElementById('currency');
            const amount=this.cBasket.reduce((acc,productID)=>{
                const product=this.products.find(item=>item.id===productID);
                return acc+product.price.value;
            },0);
            counterEl.textContent=this.cBasket.length;
            amountEl.textContent=`${viewNumber(amount)}`;

        }
    }
    class Currency{
        constructor({data,currencyBY,productsClass,basket}){
            this.data=[...data];
            this.BY=currencyBY;
            this.products=productsClass;
            this.basket=basket;
        }
        change(event){
            event.preventDefault();

            if(changeValue.textContent==='USD'){
                changeValue.textContent='BYN';
                for(let i=0;i<this.data.length;i++){
                    this.data[i].price.value*=this.BY.Cur_OfficialRate;
                    this.data[i].price.currency='BYN';
                }
                this.products.render();
                this.basket.renderBasket();
            }else{
                changeValue.textContent='USD';
                for(let i=0;i<this.data.length;i++){
                    this.data[i].price.value=this.data[i].price.value/this.BY.Cur_OfficialRate;
                    this.data[i].price.currency='USD';
                }
                this.products.render();
                this.basket.renderBasket();
            }
        }
    }
    const serverData= await fetch('http://localhost:3000/api/products')
        .then(response=>response.json())
        .then(data=>data)
        .catch(err => {
            console.log(err);
            return [];
        });
    const currencyBY= await fetch('http://www.nbrb.by/api/exrates/rates/840?parammode=1')
        .then(response=>response.json())
        .then(data=>data)
        .catch(error=>console.log('error'));


    const sectionEl=document.getElementById('content');
    const sort=document.getElementById('sort');
    const search=document.getElementById('input');
    const changeValue=document.getElementById('changeValue');


    if(localStorage.getItem('currentBasket')===null){
        localStorage.setItem('currentBasket','[]');
    }
    let currentBasket=JSON.parse(localStorage.getItem('currentBasket'));

    const basket=new Basket({
        products:serverData,
        currentBasket:currentBasket,
    });
    basket.renderBasket();
    const products = new Products({
        products: serverData,
        currentSortDirection: 'asc',
        sectionEl: sectionEl,
        basket:basket,
    });
    const changeVal=new Currency({
        data:serverData,
        productsClass: products,
        currencyBY:currencyBY,
        basket:basket,
    });
    changeValue.addEventListener("click",changeVal.change.bind(changeVal));
    search.addEventListener('input',products.search.bind(products));
    sort.addEventListener('click',products.sort.bind(products));
    products.render();

})();