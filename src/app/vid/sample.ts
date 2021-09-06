let array =
[   
{
    id:123,
    name:"peter",
    height:180
},
{
    id:124,
    name:"mary",
    height:173
}

]

array.forEach((candidate,index)=>{
    console.log(candidate);
})


/**
 * {
    id:124,
    name:"mary",
    height:173
}
 */
let newArray = array.map(candidate=>{
    return candidate.height
});
log(newArray);

/**
 * [180,173]

 * 
 * 
 */