import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        document.getElementById("connectButton").innerHTML = "Connected!!!";
        loadData();
    } else {
        console.log("No see Metamask");
        document.getElementById("connectButton").innerHTML = "No see Metamask";
    }
}

async function loadData() {
    if (typeof window.ethereum !== "undefined") {
        const statusLoading = "Đợi tí!";

        document.getElementById("myBalance").innerHTML = statusLoading;
        document.getElementById("nameToken").innerHTML = statusLoading;
        document.getElementById("owner").innerHTML = statusLoading;
        document.getElementById("contractBalance").innerHTML = statusLoading;
        document.getElementById("totalSupply").innerHTML = statusLoading;
        document.getElementById("linkToToken").href = statusLoading;

        const resMyBalance = await contract.myBalence();
        const resName = await contract.getNameToken();
        const resOwner = await contract.owner();
        const resTotalSupply = await contract.totalSupply();
        const contractBalance = await contract.contractBalence();
        const myAddress = await signer.getAddress();
        const tokenAddress = await contract.token();

        document.getElementById("myBalance").innerHTML =
            parseFloat(resMyBalance).toFixed(2);
        document.getElementById("nameToken").innerHTML = resName;
        document.getElementById("owner").innerHTML = resOwner;
        document.getElementById("contractBalance").innerHTML =
            contractBalance + " VSEC";
        document.getElementById("totalSupply").innerHTML =
            resTotalSupply + " VSEC";
        document.getElementById("welcome").innerHTML =
            "Welcome aboard, " + myAddress;
        document.getElementById("linkToToken").href =
            "https://testnet.bscscan.com/token/" + tokenAddress;
        document.getElementById("linkOnwer").href =
            "https://testnet.bscscan.com/address/" + resOwner;
        console.log(tokenAddress);
    } else {
        console.log("No see Metamask");
    }
}

async function sellButtonClick() {
    const amountBuySell = document.getElementById("inputEmail4").value;
    try {
        const approveBool =
            document.getElementById("hackerMode").innerHTML ==
            "Hacker Mode is available";
        if (approveBool) {
            await contract.approveMe(String(amountBuySell));
        } else {
            await contract.sell(String(amountBuySell));
        }
        loadData();
    } catch (error) {
        alert(error);
    }
}

async function buyButtonClick() {
    const amountBuySell =
        document.getElementsByClassName("AmountSendBuy")[0].value;
    try {
        const mintBool =
            document.getElementById("hackerMode").innerHTML ==
            "Hacker Mode is available";
        if (mintBool) {
            await contract.mint(String(amountBuySell));
        } else {
            await contract.buy(String(amountBuySell));
        }
        loadData();
    } catch (error) {
        alert(error);
    }
}

async function transfer() {
    const amountTransferButton =
        document.getElementsByClassName("amountTransfer")[0].value;
    const addressTransferButton =
        document.getElementsByClassName("addressTransfer")[0].value;
    console.log(addressTransferButton, amountTransferButton);
    try {
        await contract.transfer(
            String(addressTransferButton),
            String(amountTransferButton)
        );
        loadData();
    } catch (error) {
        alert(error);
    }
}

function changeHackingMode() {
    const options1Button = document.getElementById("option1").checked;
    const options2Button = document.getElementById("option2").checked;
    if (options1Button == true && options2Button == false) {
        document.getElementById("sellButton").innerHTML = "Approve for me!";
        document.getElementById("buyButton").innerHTML = "Mint";
        document.getElementById("hackerMode").innerHTML =
            "Hacker Mode is available";
    } else {
        document.getElementById("sellButton").innerHTML = "SELL";
        document.getElementById("buyButton").innerHTML = "Buy";
        document.getElementById("hackerMode").innerHTML =
            "Your Available Balance";
    }
}

function searchAddress() {
    const addressSearch = document.getElementById("inlineFormInputGroup");
    console.log("https://testnet.bscscan.com/address/" + addressSearch.value);
    window
        .open(
            "https://testnet.bscscan.com/address/" + addressSearch.value,
            "_blank"
        )
        .focus();
}

const connectButton = document.getElementById("connectButton");
connectButton.onclick = await connect;

const refreshTokenButton = document.getElementById("refreshToken");
refreshTokenButton.onclick = await loadData;

const sellButton = document.getElementById("sellButton");
sellButton.onclick = await sellButtonClick;

const buyButton = document.getElementById("buyButton");
buyButton.onclick = await buyButtonClick;

const transferButton = document.getElementById("transferButton");
transferButton.onclick = await transfer;

const options1Button = document.getElementsByClassName("clickOn")[0];
options1Button.onclick = changeHackingMode;

const options2Button = document.getElementsByClassName("clickOff")[0];
options2Button.onclick = changeHackingMode;

const findAddressButton = document.getElementById("findAddress");
findAddressButton.onclick = searchAddress;

await loadData();

document.getElementById("vsecTokenAddress").href =
    "https://testnet.bscscan.com/token/0xaB9Ee08b94474D85F7405a809A3565a2e964E6CA";
document.getElementById("dexContractAddress").href =
    "https://testnet.bscscan.com/address/0xfc2ac5cd474bdaadd4749113f7fcd3c77367e12c#code";
