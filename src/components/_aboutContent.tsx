import styles from "@/styles/AboutContent.module.css";

export default function AboutContent({ anchor }: { anchor: string }) {
  return (
    <div className={styles.aboutContent}>
      {anchor === "what" && (
        <>
          <h2>What is this and why is it relevant?</h2>
          <p>
            This is a proof of concept digital twin of the United States food
            system. Recent events such as the COVID-19 pandemic and Russia’s
            invasion of Ukraine have revealed inherent gaps in the way food
            systems are modeled. Particularly, these events have exposed how
            these shocks cascade through food systems and impact food security
            at an individual and community level. Digital twins of food systems
            hold massive potential to fill the decision making under food
            crises, including those caused or exacerbated by climate change.
          </p>
          <h2>What is this tool showing? </h2>
          <p>
            This tool visualizes a model designed to predict where food is grown
            and connecting that food to where it is consumed. Each colored point
            moving on the map correlates to a set number of calories from that
            food group. In the consumer view the map shows how the food that is
            consumed in a county travels to that region; in the producer view it
            shows where food that grows in that county is consumed and how it
            gets to that region.
          </p>
          <h2>What is this model?</h2>
          <p>
            The model that powers this tool uses the USDA’s{" "}
            <a href="https://data.nal.usda.gov/dataset/cropscape-cropland-data-layer">
              Cropland Data Layer
            </a>{" "}
            to generate an estimate of the types of crops that are grown in
            different regions across the United States along with data on
            imported foods. Food Availability surveys and census data were used
            to model consumption. These two data sets were connected via a
            matrix that took into account routes between where food is produced
            and consumed. Reduced yield due to climate stress was generated
            using probabilistic climate models. You can find{" "}
            <a href="https://github.com/earthrise-media/food-system-digital-twin">
              data and code we used here
            </a>
            . If you’re interested in learning more, check out our blog post on
            this project.
          </p>
        </>
      )}
      {anchor === "limitations" && (
        <p>
          This model is meant to reflect a general picture of the US food
          system. Although it takes into account waste and crops that go into
          producing animal based food products, it is only visualizing the
          production and consumption of grown foods. Out of all grown foods, the
          model is limited to food groups for which we have production and
          consumption data; this is a major reason it’s currently focused on the
          United States. Lastly, This model is designed to highlight the fragile
          supply chains that transport food. For this reason it doesn’t
          illustrate the food coming from local communities. We recognize there
          are many local food suppliers and these are a huge part of a secure
          and equitable food system. The omission of these food sources is not
          meant to detract from their importance.
        </p>
      )}
      {anchor === "how" && <p>TBD</p>}
    </div>
  );
}
