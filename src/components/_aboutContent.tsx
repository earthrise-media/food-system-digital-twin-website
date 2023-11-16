import styles from "@/styles/AboutContent.module.css";

export default function AboutContent({ anchor }: { anchor: string }) {
  return (
    <div className={styles.aboutContent}>
      {anchor === "what" && (
        <>
          <h2>What is this and why is it relevant?</h2>
          <p>
            This is a proof of concept digital twin of the United States food system. Recent events such as the COVID-19 pandemic and Russia’s invasion of Ukraine have revealed inherent gaps in the way food systems are modeled. Particularly, these events have exposed how these shocks cascade through
            food systems and impact food security at an individual and community level. Digital twins of food systems hold massive potential to fill the decision making under food crises, including those caused or exacerbated by climate change.
          </p>
          <h2>What is this tool showing? </h2>
          <p>
            This tool visualizes a model designed to predict where food is grown and connecting that food to where it is consumed. Each colored point moving on the map correlates to a set number of calories from that food group. In the consumer view the map shows how the food that is consumed in a
            county travels to that region; in the producer view it shows where food that grows in that county is consumed and how it gets to that region. It shows the roads which that food flows down from fork to fork, and how climate shocks in one region propagate through the supply chain and
            impact on the availability of food in consumers food baskets.
          </p>
          <h2>What is this model?</h2>
          <p>
            The model that powers this tool uses satellite data and survey statistics to generate an estimate of the types of crops that are grown in different regions across the United States along with data on imported foods. Food balance sheets and consumption surveys were used to model
            consumption. These two data sets were connected via a matrix that took into account routes between where food is produced and consumed. Reduced yield due to climate stress was generated using statistical crop yield models. You can find data and code we used here, and here, and here. If
            you’re interested in learning more, including a deeper dive into the data used check out our <a href="https://medium.com/@cameronwkruse/af94b06dbd1f">blog post on this project</a>.
          </p>
          <h2>Who built it?</h2>
          <p>
            Food Twin is a collaboration between <a href="http://www.ziamehrabi.com/index.html">Zia Mehrabi</a> and <a href="https://theplotline.org/">the Plotline</a>. Application development was led by <a href="https://developmentseed.org/">Development Seed</a>.
          </p>
        </>
      )}
      {anchor === "limitations" && (
        <p>
          This model is meant to reflect a general picture of the US food system. Although it takes into account waste and crops that go into producing animal based food products, and exports, it is only visualizing the imports, production and consumption of plant based foods. Out of all plant based foods, the model is limited to food groups for which we have production and consumption data; this is a major reason it’s currently focused on the United States. We also only represent road based food flows, although trucking is involved in at least one part of the journey from farm to fork in the nation, making up 84% of agricultural freight, and 88% of the value of transported goods in total. Lastly, This model is designed to highlight the fragile supply chains that transport food. For this reason it doesn’t illustrate all of the food coming from local communities, such as that is not represented in the agricultural census. We recognize there are many local food suppliers and these are a huge part of a secure and equitable food system. The omission of these food sources is not meant to detract from their importance.
        </p>
      )}
      {anchor === "more" && (
        <>
          <ul>
            <li>
              <a href="https://github.com/earthrise-media/food-system-digital-twin" target="_blank" rel="noopener noreferrer">
                This repository lists all data inputs that are used in the supply chain model
              </a>
            </li>
            <li>
              <a href="https://github.com/earthrise-media/food-system-digital-twin/blob/main/normalizing-supply-and-demand.ipynb" target="_blank" rel="noopener noreferrer">
                This notebook contains the scripts used to develop data for the supply and demand models
              </a>
            </li>
            <li>
              <a href="https://github.com/earthrise-media/food-system-digital-twin/tree/main/routing" target="_blank" rel="noopener noreferrer">
                This folder contains the scripts used to solve the routing connecting supply to demand
              </a>
            </li>
            <li>
              <a href="https://github.com/Better-Planet-Laboratory/cropmodUS" target="_blank" rel="noopener noreferrer">
                This repository contains information and code used to generate the statistical crop yield models and climate impact data
              </a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
